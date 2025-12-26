"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Star,
  MessageSquare,
  Download,
  FileText,
  Settings,
} from "lucide-react"

interface SaaSMetrics {
  totalUsers: number
  activeUsers: number
  monthlyRevenue: number
  churnRate: number
  subscriptions: {
    active: number
    trial: number
    cancelled: number
    expired: number
  }
  plans: {
    basic: number
    pro: number
    enterprise: number
  }
}

interface RevenueData {
  month: string
  revenue: number
  users: number
}

export default function SaaSDashboardPage() {
  const [metrics, setMetrics] = useState<SaaSMetrics>({
    totalUsers: 12847,
    activeUsers: 9234,
    monthlyRevenue: 89750,
    churnRate: 3.2,
    subscriptions: {
      active: 8456,
      trial: 1234,
      cancelled: 567,
      expired: 234,
    },
    plans: {
      basic: 5234,
      pro: 2890,
      enterprise: 332,
    },
  })

  const [revenueData] = useState<RevenueData[]>([
    { month: "Jan", revenue: 65000, users: 8500 },
    { month: "Feb", revenue: 72000, users: 9200 },
    { month: "Mar", revenue: 78000, users: 10100 },
    { month: "Apr", revenue: 81000, users: 11200 },
    { month: "May", revenue: 85000, users: 11800 },
    { month: "Jun", revenue: 89750, users: 12847 },
  ])

  const [notifications] = useState([
    {
      id: 1,
      type: "payment_failed",
      title: "Payment Failed",
      message: "3 customers have failed payments requiring attention",
      priority: "high",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "trial_ending",
      title: "Trials Ending Soon",
      message: "47 trial users expire in the next 3 days",
      priority: "medium",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "support_ticket",
      title: "New Support Tickets",
      message: "12 new support tickets need review",
      priority: "medium",
      time: "6 hours ago",
    },
  ])

  const getGrowthPercentage = (current: number, previous: number) => {
    return (((current - previous) / previous) * 100).toFixed(1)
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
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SaaS Dashboard</h1>
            <p className="text-gray-600">Monitor your business performance and growth</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{metrics.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />+{getGrowthPercentage(metrics.totalUsers, 11200)}% from last
                month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${metrics.monthlyRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />+{getGrowthPercentage(metrics.monthlyRevenue, 85000)}% from last
                month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{metrics.activeUsers.toLocaleString()}</div>
              <div className="text-xs text-gray-600">
                {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of total users
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{metrics.churnRate}%</div>
              <div className="text-xs text-green-600">-0.8% from last month</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                <UserPlus className="h-6 w-6 mb-2" />
                <span className="text-sm">Add User</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm">Billing</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                <MessageSquare className="h-6 w-6 mb-2" />
                <span className="text-sm">Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Active Subscriptions</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.subscriptions.active.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">94.2% of total</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm">Trial Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.subscriptions.trial.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">13.7% conversion rate</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.subscriptions.cancelled.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">6.3% of total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Basic Plan</span>
                    <span className="text-sm text-gray-600">{metrics.plans.basic.toLocaleString()}</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pro Plan</span>
                    <span className="text-sm text-gray-600">{metrics.plans.pro.toLocaleString()}</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Enterprise Plan</span>
                    <span className="text-sm text-gray-600">{metrics.plans.enterprise.toLocaleString()}</span>
                  </div>
                  <Progress value={4} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Tracking */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Revenue & Growth Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
                <TabsTrigger value="users">User Growth</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="mt-6">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Revenue chart visualization would go here</p>
                    <p className="text-sm text-gray-500">Monthly revenue: ${metrics.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="users" className="mt-6">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">User growth chart would go here</p>
                    <p className="text-sm text-gray-500">Total users: {metrics.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="performance" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">98.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1.2s</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">4.8/5</div>
                    <div className="text-sm text-gray-600">Customer Rating</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Customer Support & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Customer Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Open Tickets</div>
                    <div className="text-sm text-gray-600">Requires attention</div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">23</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Avg Response Time</div>
                    <div className="text-sm text-gray-600">Last 30 days</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">2.4h</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Customer Satisfaction</div>
                    <div className="text-sm text-gray-600">This month</div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-white">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
