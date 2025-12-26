"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingDown, Users, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import type { DashboardAnalytics } from "@/lib/mock-data"

interface AttendanceAnalyticsProps {
  analytics: DashboardAnalytics
}

const COLORS = ["#0891b2", "#10b981", "#f59e0b", "#ef4444"]

export function AttendanceAnalytics({ analytics }: AttendanceAnalyticsProps) {
  const { attendanceAnalytics } = analytics

  // Prepare data for pie chart
  const attendancePieData = [
    { name: "Present", value: attendanceAnalytics.monthlyAttendanceSummary.present, color: "#10b981" },
    { name: "Absent", value: attendanceAnalytics.monthlyAttendanceSummary.absent, color: "#ef4444" },
    { name: "Late", value: attendanceAnalytics.monthlyAttendanceSummary.late, color: "#f59e0b" },
    { name: "Early Exit", value: attendanceAnalytics.monthlyAttendanceSummary.earlyExit, color: "#8b5cf6" },
  ]

  const totalAttendance = attendancePieData.reduce((sum, item) => sum + item.value, 0)
  const presentPercentage =
    totalAttendance > 0
      ? ((attendanceAnalytics.monthlyAttendanceSummary.present / totalAttendance) * 100).toFixed(1)
      : 0

  return (
    <div className="space-y-6">
      {/* Monthly Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {attendanceAnalytics.monthlyAttendanceSummary.present}
            </div>
            <p className="text-xs text-muted-foreground">{presentPercentage}% attendance rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{attendanceAnalytics.monthlyAttendanceSummary.absent}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {attendanceAnalytics.monthlyAttendanceSummary.late}
            </div>
            <p className="text-xs text-muted-foreground">Monitor punctuality</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Exits</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {attendanceAnalytics.monthlyAttendanceSummary.earlyExit}
            </div>
            <p className="text-xs text-muted-foreground">Early departures</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trends Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Attendance Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceAnalytics.attendanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [value, name === "present" ? "Present" : "Absent"]}
              />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendancePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frequent Absences */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Frequent Absences Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceAnalytics.frequentAbsences.length > 0 ? (
                attendanceAnalytics.frequentAbsences.map((employee) => (
                  <div
                    key={employee.employeeId}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{employee.employeeName}</div>
                      <div className="text-sm text-gray-600">ID: {employee.employeeId}</div>
                    </div>
                    <Badge variant="destructive">{employee.absenceCount} days</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>No frequent absences detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
