"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  Bell,
  TrendingUp,
  AlertTriangle,
  Gift,
  Award,
  BarChart3,
} from "lucide-react"
import type { DashboardAnalytics, Notification } from "@/lib/mock-data"
import { AttendanceAnalytics } from "@/components/dashboard/attendance-analytics"
import { LeaveAnalytics } from "@/components/dashboard/leave-analytics"
import { NotificationAlerts } from "@/components/dashboard/notification-alerts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { VisualAnalytics } from "@/components/dashboard/visual-analytics"
import { SearchFilterSystem } from "@/components/dashboard/search-filter-system"

interface DashboardStats {
  totalEmployees: number
  totalDepartments: number
  monthlySalary: number
  leaves: {
    applied: number
    approved: number
    pending: number
    rejected: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalDepartments: 0,
    monthlySalary: 0,
    leaves: {
      applied: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    },
  })

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
    fetchAnalytics()
    fetchNotifications()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/dashboard/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.slice(0, 5)) // Show only top 5 notifications
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="h-4 w-4" />
      case "attendance_anomaly":
        return <AlertTriangle className="h-4 w-4" />
      case "birthday":
        return <Gift className="h-4 w-4" />
      case "work_anniversary":
        return <Award className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <NotificationAlerts />

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <SearchFilterSystem onSearchResults={handleSearchResults} searchType="employees" />

        <QuickActions />

        {/* Employee Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {analytics?.employeeOverview.totalEmployees || stats.totalEmployees}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building2 className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">${stats.monthlySalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total payroll expense</p>
            </CardContent>
          </Card>
        </div>

        {/* Department-wise Employee Count */}
        {analytics && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Department-wise Employee Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.employeeOverview.departmentWiseCount).map(([dept, count]) => (
                  <div key={dept} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{count}</div>
                    <div className="text-sm text-gray-600">{dept}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recently Added Employees */}
        {analytics && analytics.employeeOverview.recentlyAdded.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Recently Added Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.employeeOverview.recentlyAdded.map((employee) => (
                  <div key={employee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">
                          {employee.department} • {employee.position}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tabs */}
        {analytics && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="attendance">Attendance Analytics</TabsTrigger>
                  <TabsTrigger value="leave">Leave Analytics</TabsTrigger>
                  <TabsTrigger value="visual">Visual Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="attendance" className="mt-6">
                  <AttendanceAnalytics analytics={analytics} />
                </TabsContent>
                <TabsContent value="leave" className="mt-6">
                  <LeaveAnalytics analytics={analytics} />
                </TabsContent>
                <TabsContent value="visual" className="mt-6">
                  <VisualAnalytics />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Leave Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <Calendar className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{stats.leaves.applied}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.leaves.approved}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.leaves.pending}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.leaves.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${notification.read ? "bg-gray-50" : "bg-blue-50 border-blue-200"}`}
                  >
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
