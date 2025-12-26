"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import EmployeeLayout from "@/components/layout/employee-layout"
import { useToast } from "@/hooks/use-toast"

interface Leave {
  _id?: string
  employeeId: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const { toast } = useToast()

  const [currentEmployee, setCurrentEmployee] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    // Load logged in user from localStorage
    const loadUser = () => {
      // Check if we're in the browser
      if (typeof window === 'undefined') return

      const stored = localStorage.getItem("user")
      if (stored) {
        try {
          const user = JSON.parse(stored)
          // Log for debugging
          console.log("Loaded user data:", user)
          
          // Handle different user data structures
          // Ensure we're using the business employeeId (EMP001 format), not the DB _id
          const employeeId = user.employeeId || user.id
          const employeeName = user.name || user.fullName
          
          if (!employeeId || !employeeName) {
            throw new Error("Invalid user data structure - missing employeeId/name")
          }

          // Log for debugging
          console.log("Setting current employee with:", { employeeId, employeeName })

          setCurrentEmployee({
            id: employeeId,
            name: employeeName
          })
          
          // Log successful setup
          console.log("Set current employee:", { id: employeeId, name: employeeName })
        } catch (e) {
          console.error("Error parsing stored user:", e)
          toast({
            title: "Error",
            description: "Failed to load user data. Please try logging in again.",
            variant: "destructive",
          })
        }
      } else {
        console.log("No user data found in localStorage")
        toast({
          title: "Error",
          description: "Please log in to access your leaves.",
          variant: "destructive",
        })
      }
    }
    
    loadUser()
  }, []) // Load user once when component mounts

  // Fetch leaves when user is loaded
  useEffect(() => {
    if (currentEmployee) {
      fetchEmployeeLeaves()
    }
  }, [currentEmployee])

  const fetchEmployeeLeaves = async () => {
    if (!currentEmployee?.id) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/leaves?employeeId=${encodeURIComponent(currentEmployee.id)}`)
      if (response.ok) {
        const employeeLeaves = await response.json()
        setLeaves(employeeLeaves)
      }
    } catch (error) {
      console.error("Error fetching leaves:", error)
      toast({
        title: "Error",
        description: "Failed to fetch leave history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleApply = async () => {
    if (!currentEmployee?.id) {
      toast({
        title: "Error",
        description: "Please log in again to apply for leave.",
        variant: "destructive",
      })
      return
    }

    // Validate start and end dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast({
        title: "Invalid Date",
        description: "Start date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    if (end < start) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type && formData.startDate && formData.endDate && formData.reason) {
      setIsSubmitting(true)
      console.log("Submitting leave request:", {
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        ...formData
      })

      try {
        const response = await fetch("/api/leaves", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: currentEmployee.id,
            employeeName: currentEmployee.name,
            leaveType: formData.type,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason,
          }),
        })

        // Read response body (try JSON, fallback to text) for better error messages
        const text = await response.text().catch(() => null)
        let body: any = null
        try {
          body = text ? JSON.parse(text) : null
        } catch (err) {
          body = { raw: text }
        }

        console.log("/api/leaves (employee) response:", response.status, body)

        if (response.ok) {
          const result = body

          // Refresh the leaves list
          await fetchEmployeeLeaves()

          setFormData({ type: "", startDate: "", endDate: "", reason: "" })
          setIsApplying(false)

          toast({
            title: "Leave Application Submitted",
            description: "Your leave request has been submitted successfully and is pending approval.",
          })
        } else {
          const message = body?.message || body?.error || body?.raw || "Failed to submit leave request. Please try again."
          console.error("Failed to submit leave (employee):", response.status, message)
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error submitting leave:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const leaveStats = {
    total: leaves.length,
    approved: leaves.filter((l) => l.status === "approved").length,
    pending: leaves.filter((l) => l.status === "pending").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  }

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leaves...</div>
        </div>
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Leaves</h1>
            <p className="text-gray-600">Apply for leaves and track your leave history</p>
          </div>
          <Dialog open={isApplying} onOpenChange={setIsApplying}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>Submit a new leave application</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleApply();
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Leave Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                        <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  {formData.startDate && formData.endDate && (
                    <div className="text-sm text-gray-600">
                      Duration: {calculateDays(formData.startDate, formData.endDate)} day(s)
                    </div>
                  )}
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a reason for your leave"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      minLength={10}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsApplying(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700" 
                    disabled={isSubmitting || !formData.type || !formData.startDate || !formData.endDate || !formData.reason}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{leaveStats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{leaveStats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{leaveStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{leaveStats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave History */}
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
            <CardDescription>Your recent leave applications and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaves.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leave applications found. Apply for your first leave above.
                </div>
              ) : (
                leaves.map((leave) => (
                  <div key={leave._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(leave.status)}
                      <div>
                        <h3 className="font-medium">{leave.leaveType}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{leave.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {calculateDays(leave.startDate, leave.endDate)} day(s)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  )
}
