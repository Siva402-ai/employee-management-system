"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Download, Search, Users, Clock, UserX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  id?: string
  employeeId: string
  // business id resolved from employees collection (preferred for display)
  employeeBusinessId?: string
  employeeName: string
  department: string
  date: string
  punchIn?: string
  punchOut?: string
  totalHours?: number
  status: "Present" | "Absent" | "Late" | "Early Exit"
}

export default function AttendanceManagement() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const recordsPerPage = 10
  const { toast } = useToast()

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [attendanceRecords, searchTerm, departmentFilter, dateFilter])

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch("/api/attendance")
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = attendanceRecords

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((record) => record.department === departmentFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter((record) => record.date === dateFilter)
    }

    setFilteredRecords(filtered)
    setCurrentPage(1)
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800"
      case "Late":
        return "bg-yellow-100 text-yellow-800"
      case "Early Exit":
        return "bg-orange-100 text-orange-800"
      case "Absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTodayStats = () => {
    const todayRecords = attendanceRecords.filter((record) => record.date === today)
    const present = todayRecords.filter((record) => record.status === "Present").length
    const late = todayRecords.filter((record) => record.status === "Late").length
    const absent = todayRecords.filter((record) => record.status === "Absent").length
    const earlyExit = todayRecords.filter((record) => record.status === "Early Exit").length

    return { present, late, absent, earlyExit, total: todayRecords.length }
  }

  const getNotifications = () => {
    const todayRecords = attendanceRecords.filter((record) => record.date === today)
    const lateEmployees = todayRecords.filter((record) => record.status === "Late")
    const forgotPunchOut = todayRecords.filter((record) => record.punchIn && !record.punchOut)
    const lowAttendance = attendanceRecords.filter((record) => {
      // Mock calculation for attendance below 70%
      return Math.random() < 0.1 // 10% chance for demo
    })

    return { lateEmployees, forgotPunchOut, lowAttendance }
  }

  const handleExportReport = () => {
    // Mock export functionality
    toast({
      title: "Report Exported",
      description: "Attendance report has been downloaded successfully.",
    })
  }

  const stats = getTodayStats()
  const notifications = getNotifications()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading attendance data...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
            <p className="text-gray-600">Monitor and manage employee attendance</p>
          </div>
          <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Early Exit</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.earlyExit}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-800">Late Employees</div>
                <div className="text-2xl font-bold text-yellow-600">{notifications.lateEmployees.length}</div>
                <div className="text-sm text-yellow-600">employees arrived late today</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="font-medium text-red-800">Forgot Punch Out</div>
                <div className="text-2xl font-bold text-red-600">{notifications.forgotPunchOut.length}</div>
                <div className="text-sm text-red-600">employees forgot to punch out</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">Low Attendance</div>
                <div className="text-2xl font-bold text-orange-600">{notifications.lowAttendance.length}</div>
                <div className="text-sm text-orange-600">employees below 70% this month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setDepartmentFilter("all")
                  setDateFilter("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Employee Attendance</CardTitle>
            <CardDescription>Complete attendance records for all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Punch In</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Punch Out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`border-b ${
                        (indexOfFirstRecord + index) % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {/* Prefer the enriched business employeeId when available, fallback to stored employeeId or name or id */}
                        {record.employeeBusinessId || record.employeeId || record.employeeName || record.id}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{record.employeeName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          {record.department}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-700">{record.punchIn || "--:--"}</td>
                      <td className="py-3 px-4 text-gray-700">{record.punchOut || "--:--"}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(record.status)} font-medium`}>{record.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of{" "}
                  {filteredRecords.length} records
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-teal-600 hover:bg-teal-700" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
