"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react"
import type { DashboardAnalytics } from "@/lib/mock-data"

interface LeaveAnalyticsProps {
  analytics: DashboardAnalytics
}

const LEAVE_COLORS = ["#f59e0b", "#10b981", "#ef4444"]

export function LeaveAnalytics({ analytics }: LeaveAnalyticsProps) {
  const { leaveAnalytics } = analytics

  // Prepare data for pie chart
  const leavePieData = [
    { name: "Pending", value: leaveAnalytics.leaveStatusOverview.pending, color: "#f59e0b" },
    { name: "Approved", value: leaveAnalytics.leaveStatusOverview.approved, color: "#10b981" },
    { name: "Rejected", value: leaveAnalytics.leaveStatusOverview.rejected, color: "#ef4444" },
  ]

  const totalLeaves = leavePieData.reduce((sum, item) => sum + item.value, 0)
  const approvalRate =
    totalLeaves > 0 ? ((leaveAnalytics.leaveStatusOverview.approved / totalLeaves) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Leave Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{leaveAnalytics.leaveStatusOverview.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{leaveAnalytics.leaveStatusOverview.approved}</div>
            <p className="text-xs text-muted-foreground">{approvalRate}% approval rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{leaveAnalytics.leaveStatusOverview.rejected}</div>
            <p className="text-xs text-muted-foreground">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Trends and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Trends Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Leave Trends (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leaveAnalytics.leaveTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leaves" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Status Distribution */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Leave Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leavePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leavePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leave Insights */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Leave Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalLeaves}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
              <div className="text-sm text-gray-600">Approval Rate</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{leaveAnalytics.leaveStatusOverview.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
