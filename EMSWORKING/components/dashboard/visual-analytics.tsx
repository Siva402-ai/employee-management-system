"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
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
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Users, Calendar, DollarSign, BarChart3 } from "lucide-react"

// Mock data for visual analytics
const departmentHeadcountData = [
  { department: "Engineering", count: 15, growth: 12 },
  { department: "Marketing", count: 8, growth: 5 },
  { department: "Sales", count: 12, growth: 8 },
  { department: "HR", count: 5, growth: 2 },
  { department: "Finance", count: 6, growth: 1 },
]

const monthlyTrendsData = [
  { month: "Aug", attendance: 92, leaves: 5, newHires: 2 },
  { month: "Sep", attendance: 89, leaves: 8, newHires: 3 },
  { month: "Oct", attendance: 94, leaves: 12, newHires: 1 },
  { month: "Nov", attendance: 91, leaves: 7, newHires: 4 },
  { month: "Dec", attendance: 88, leaves: 15, newHires: 2 },
  { month: "Jan", attendance: 93, leaves: 10, newHires: 5 },
]

const salaryDistributionData = [
  { range: "40-50k", count: 8, color: "#0891b2" },
  { range: "50-60k", count: 12, color: "#10b981" },
  { range: "60-70k", count: 15, color: "#f59e0b" },
  { range: "70-80k", count: 10, color: "#ef4444" },
  { range: "80k+", count: 5, color: "#8b5cf6" },
]

const performanceMetricsData = [
  { metric: "Productivity", score: 85 },
  { metric: "Satisfaction", score: 78 },
  { metric: "Retention", score: 92 },
  { metric: "Engagement", score: 81 },
]

export function VisualAnalytics() {
  return (
    <div className="space-y-6">
      {/* Department Headcount Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Department-wise Headcount & Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentHeadcountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0891b2" name="Current Headcount" />
              <Bar dataKey="growth" fill="#10b981" name="Growth %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Leave & Hiring Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leaves" stroke="#f59e0b" strokeWidth={2} name="Leaves" />
                <Line type="monotone" dataKey="newHires" stroke="#10b981" strokeWidth={2} name="New Hires" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Salary Distribution and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Salary Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={salaryDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {salaryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceMetricsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="metric" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="score" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-600">Average Attendance</div>
              <div className="text-xs text-green-600 mt-1">↑ 3% from last month</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-gray-600">New Hires (6 months)</div>
              <div className="text-xs text-blue-600 mt-1">Engineering leading</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Employee Satisfaction</div>
              <div className="text-xs text-purple-600 mt-1">Above industry average</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
