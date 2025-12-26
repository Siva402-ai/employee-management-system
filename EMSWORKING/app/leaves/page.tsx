"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmployeeSelect } from "@/components/ui/employee-select"

interface Leave {
  id?: string;
  _id?: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingLeaveId, setProcessingLeaveId] = useState<string | null>(null)

  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const searchParams = useSearchParams()
  const employeeFilter = searchParams.get("employeeId") || ""

  const leaveApplicationsTitle = `Leave Applications${employeeFilter ? ' • ' + employeeFilter : ''}`;

  const { toast } = useToast()

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Ensure we have both _id and id fields for consistency
      const normalizedData = data.map((leave: Leave) => ({
        ...leave,
        _id: leave._id || leave.id,
        id: leave.id || leave._id
      }))
      
      setLeaves(normalizedData)
      console.log("[Client] Leaves refreshed:", normalizedData.length, "items")
    } catch (error) {
      console.error("Error fetching leaves:", error)
      toast({
        title: "Error",
        description: "Failed to refresh leaves data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

    // Helper function to check if a leave matches an ID (either id or _id)
  const isLeaveMatch = (leave: Leave, targetId: string) => {
    return leave.id === targetId || leave._id === targetId;
  };

  const handleStatusChange = async (inputId: string, newStatus: "approved" | "rejected") => {
    console.log("[Client] Starting leave status update:", { inputId, newStatus });

    // Find the leave object first by either id/_id
    const leaveToUpdate = leaves.find(l => isLeaveMatch(l, inputId))
    if (!leaveToUpdate) {
      // try to find by matching id or _id in-case inputId was one or the other
      const alt = leaves.find(l => l._id === inputId || l.id === inputId)
      if (alt) {
        // found by alternate, use that
        console.warn('[Client] Found leave by alternate id:', alt)
      } else {
        console.error('[Client] Leave not found with any id match:', inputId)
        toast({ title: 'Error', description: 'Leave application not found', variant: 'destructive' })
        return
      }
    }

    if (!leaveToUpdate) {
      toast({ title: 'Error', description: 'Leave not found in the list', variant: 'destructive' })
      return
    }

    const previousStatus = leaveToUpdate.status

    // Prepare candidate ids (prefer _id then legacy id)
    const candidateIds = [leaveToUpdate._id, leaveToUpdate.id].filter(Boolean) as string[]
    if (candidateIds.length === 0) {
      toast({ title: 'Error', description: 'Leave has no identifier to update', variant: 'destructive' })
      return
    }

    // Optimistically update UI with backup of original status
    setProcessingLeaveId(candidateIds[0])
    const originalStatus = leaveToUpdate.status
    setLeaves(currentLeaves =>
      currentLeaves.map(leave =>
        isLeaveMatch(leave, candidateIds[0])
          ? { ...leave, status: newStatus }
          : leave
      )
    )

    // Try each candidate id sequentially until one succeeds
    let succeeded = false
    let lastResult: any = null
    for (const cid of candidateIds) {
      try {
        console.log('[Client] Sending PATCH for id:', cid)
        const response = await fetch(`/api/leaves/${cid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })

        const result = await response.json().catch(() => ({}))
        lastResult = { response, result }

        if (response.ok && result.success) {
          succeeded = true
          console.log("[Client] Success updating status. Server returned:", result)

          // Update the local state immediately with verified server data
          if (result.success && result.leave) {
            const updatedLeave = result.leave
            console.log("[Client] Updating with server data:", updatedLeave)

            setLeaves(currentLeaves => 
              currentLeaves.map(leave => {
                // Match either by _id or id
                if (leave._id === updatedLeave._id || leave.id === updatedLeave.id) {
                  return { ...updatedLeave }
                }
                return leave
              })
            )

            // Trigger a background refresh after a short delay
            setTimeout(() => {
              fetchLeaves().catch(e => {
                console.warn("[Client] Background refresh failed:", e)
              })
            }, 1000)
          }

          // Then do a background refresh to ensure we're fully in sync
          fetchLeaves().catch(e => {
            console.warn('[Client] Background refresh failed:', e)
          })

          toast({ title: 'Success', description: `Leave has been ${newStatus}` })
          setProcessingLeaveId(null)
          return
        }

        // If 404, try next candidate id; otherwise break and treat as failure
        if (response.status === 404) {
          console.warn('[Client] PATCH returned 404 for id', cid, 'trying next candidate if any')
          continue
        } else {
          console.error('[Client] PATCH error for id', cid, result)
          break
        }
      } catch (err) {
        console.error('[Client] Network/error while PATCHing id', cid, err)
        // try next candidate
        continue
      }
    }

    if (!succeeded) {
      // Edge case: sometimes the server may perform a fallback update but
      // return a non-OK response for earlier candidate IDs. If the last
      // response body includes a `leave`, prefer merging that into state
      // instead of reverting the optimistic update.
      const serverLeaveFromLast = lastResult?.result?.leave || null
      if (serverLeaveFromLast) {
        console.warn('[Client] No candidate marked succeeded but server returned leave in last response - merging result to UI')
        const serverIds: string[] = [serverLeaveFromLast._id, serverLeaveFromLast.id].filter(Boolean)
        setLeaves(currentLeaves => {
          const exists = currentLeaves.some(l => serverIds.some(sid => isLeaveMatch(l, sid)))
          if (exists) {
            return currentLeaves.map(l => serverIds.some(sid => isLeaveMatch(l, sid)) ? { ...l, ...serverLeaveFromLast, status: newStatus } : l)
          }
          return [ ...currentLeaves, serverLeaveFromLast ]
        })
        toast({ title: 'Success', description: `Leave has been ${newStatus}` })
        setProcessingLeaveId(null)
        return
      }
      // Revert optimistic update to original status
      setLeaves(currentLeaves =>
        currentLeaves.map(leave =>
          isLeaveMatch(leave, candidateIds[0])
            ? { ...leave, status: originalStatus }
            : leave
        )
      )

      const message = lastResult?.result?.message || 'Failed to update leave status. Please try again.'
      toast({ title: 'Update Failed', description: message, variant: 'destructive' })
    }

    setProcessingLeaveId(null)
  }

  

  const validateDates = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return startDate <= endDate
  }

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate employee selection
    if (!newLeave.employeeId || !newLeave.employeeName) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Validate dates
    if (!validateDates(newLeave.startDate, newLeave.endDate)) {
      toast({
        title: "Error",
        description: "End date must be after or equal to start date",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newLeave,
          status: "pending",
        }),
      });

      const text = await response.text().catch(() => null)
      let body: any = null
      try {
        body = text ? JSON.parse(text) : null
      } catch (err) {
        body = { raw: text }
      }

      console.log("/api/leaves response status:", response.status, "body:", body)

      if (response.ok) {
        await fetchLeaves();
        setNewLeave({
          employeeId: "",
          employeeName: "",
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
        setIsAddDialogOpen(false);
        toast({
          title: "Leave Application Submitted",
          description: "Leave request has been submitted successfully.",
        });
      } else {
        const message = body?.message || body?.error || body?.raw || "Failed to submit leave request. Please try again."
        console.error("Failed to submit leave:", response.status, message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding leave:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Applied</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600"
      case "rejected":
        return "text-red-600"
      case "pending":
        return "text-yellow-600"
      default:
        return "text-teal-600"
    }
  }

  const leavesToShow = employeeFilter
    ? leaves.filter((l) => l.employeeId.toLowerCase() === employeeFilter.toLowerCase())
    : leaves

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leaves...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Leave Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddLeave} className="space-y-4">
                <div>
                  <Label>Employee</Label>
                  <EmployeeSelect 
                    onSelect={(employee) => 
                      setNewLeave({ 
                        ...newLeave, 
                        employeeId: employee.employeeId,
                        employeeName: employee.name 
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={newLeave.leaveType}
                    onValueChange={(value) => setNewLeave({ ...newLeave, leaveType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                      <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                      <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                      <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    placeholder="Reason for leave..."
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Leave"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applied</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {leavesToShow.filter((leave) => leave.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-500">
                    {leavesToShow.filter((leave) => leave.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {leavesToShow.filter((leave) => leave.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-500">
                    {leavesToShow.filter((leave) => leave.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaves Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{leaveApplicationsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">S No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Leave Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leavesToShow.map((leave, index) => {
                    return (
                      <tr
                        key={leave._id || leave.id}
                        className={"border-b " + (index % 2 === 0 ? "bg-gray-50" : "bg-white") + " hover:bg-gray-100"}
                      >
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{leave.employeeName}</div>
                            <div className="text-xs text-gray-500">Employee ID: {leave.employeeId}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{leave.leaveType}</td>
                        <td className="py-3 px-4 text-gray-700">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-700">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{leave.reason}</td>
                        <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                        <td className="py-3 px-4">
                          {leave.status === "pending" ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleStatusChange(leave._id || leave.id || "", "approved")}
                                disabled={isLeaveMatch(leave, processingLeaveId || "")}
                              >
                                {isLeaveMatch(leave, processingLeaveId || "") ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleStatusChange(leave._id || leave.id || "", "rejected")}
                                disabled={isLeaveMatch(leave, processingLeaveId || "")}
                              >
                                {isLeaveMatch(leave, processingLeaveId || "") ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className={"text-sm font-medium " + getStatusColor(leave.status)}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
