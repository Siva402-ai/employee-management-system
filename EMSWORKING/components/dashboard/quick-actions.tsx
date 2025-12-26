"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, CheckCircle, FileText, Download, Calendar, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Leave {
  _id?: string;
  id?: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export function QuickActions() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isApproveLeaveOpen, setIsApproveLeaveOpen] = useState(false)
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false)
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([])
  const [departments, setDepartments] = useState<string[]>([])

  const handleAddEmployee = async (formData: FormData) => {
    try {
      // In production, this would make an API call
      toast({
        title: "Employee Added",
        description: "New employee has been successfully added to the system.",
      })
      setIsAddEmployeeOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      })
    }
  }
    useEffect(() => {
      fetchPendingLeaves()
    }, [isApproveLeaveOpen])

    const fetchPendingLeaves = async () => {
      try {
        const response = await fetch("/api/leaves?status=pending")
        if (!response.ok) throw new Error("Failed to fetch pending leaves")
        const data = await response.json()
        setPendingLeaves(data)
      } catch (error) {
        console.error("Error fetching pending leaves:", error)
        toast({
          title: "Error",
          description: "Failed to fetch pending leave requests",
          variant: "destructive"
        })
      }
    }

  // load departments for select lists
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch('/api/departments')
        if (!res.ok) return
        const data = await res.json()
        const names = Array.isArray(data) ? data.map((d: any) => d.name || d.department || d.title).filter(Boolean) : []
        setDepartments(names)
      } catch (err) {
        console.warn('Failed to load departments', err)
      }
    }

    loadDepartments()
  }, [])

  const handleApproveLeave = async (leaveId: string, action: "approve" | "reject") => {
    try {
        const response = await fetch(`/api/leaves/${leaveId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" })
        })

        if (!response.ok) throw new Error("Failed to update leave status")

        const result = await response.json()
        if (result.success) {
          toast({
            title: `Leave ${action === "approve" ? "Approved" : "Rejected"}`,
            description: `Leave request has been ${action === "approve" ? "approved" : "rejected"}.`,
          })
          // Update local state
          setPendingLeaves(currentLeaves => 
            currentLeaves.filter(leave => leave._id !== leaveId && leave.id !== leaveId)
          )
        }
    } catch (error) {
        console.error("Error updating leave:", error)
      toast({
        title: "Error",
        description: "Failed to process leave request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    try {
      // In production, this would generate and download the report
      toast({
        title: "Report Generated",
        description: `${reportType} report has been generated and will be downloaded shortly.`,
      })
      setIsGenerateReportOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/dashboard/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}_export.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Successful",
          description: `${type} data has been exported successfully.`,
        })
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
    setIsExportMenuOpen(false)
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Add Employee */}
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex-col bg-transparent hover:bg-teal-50">
                <UserPlus className="h-6 w-6 mb-2 text-teal-600" />
                <span className="text-sm">Add Employee</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form action={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input id="employeeId" name="employeeId" placeholder="EMP001" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select name="department" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                          {departments.length > 0 ? (
                            departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)
                          ) : (
                            <>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                            </>
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" placeholder="Software Developer" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input id="salary" name="salary" type="number" placeholder="75000" required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    Add Employee
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Approve Leave */}
          <Dialog open={isApproveLeaveOpen} onOpenChange={setIsApproveLeaveOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex-col bg-transparent hover:bg-green-50">
                <CheckCircle className="h-6 w-6 mb-2 text-green-600" />
                <span className="text-sm">Approve Leave</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Pending Leave Requests</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                  {pendingLeaves.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">No pending leave requests</div>
                  ) : (
                    pendingLeaves.map((leave) => (
                      <div key={leave._id || leave.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{leave.employeeName}</h4>
                            <p className="text-sm text-gray-600">
                              {leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveLeave(leave._id || leave.id || "", "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleApproveLeave(leave._id || leave.id || "", "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Generate Report */}
          <Dialog open={isGenerateReportOpen} onOpenChange={setIsGenerateReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex-col bg-transparent hover:bg-blue-50">
                <FileText className="h-6 w-6 mb-2 text-blue-600" />
                <span className="text-sm">Generate Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">Attendance Report</SelectItem>
                      <SelectItem value="leave">Leave Report</SelectItem>
                      <SelectItem value="payroll">Payroll Report</SelectItem>
                      <SelectItem value="performance">Performance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="Start date" />
                    <Input type="date" placeholder="End date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.length > 0 ? (
                        departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)
                      ) : (
                        <>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsGenerateReportOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleGenerateReport("Attendance")} className="bg-blue-600 hover:bg-blue-700">
                    Generate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Export Data */}
          <Dialog open={isExportMenuOpen} onOpenChange={setIsExportMenuOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex-col bg-transparent hover:bg-purple-50">
                <Download className="h-6 w-6 mb-2 text-purple-600" />
                <span className="text-sm">Export Data</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleExport("employees")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Export Employees
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleExport("attendance")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Export Attendance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleExport("leaves")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Leaves
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
