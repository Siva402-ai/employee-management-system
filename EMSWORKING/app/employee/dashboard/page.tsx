"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react"

interface Leave {
  _id?: string
  id?: string
  employeeId: string
  leaveType?: string
  type?: string
  status: string
  startDate: string
  endDate: string
}

interface Salary {
  _id?: string
  id?: string
  employeeId: string
  month: string | number
  year: string | number
  netSalary?: number
  net?: number
}

interface Employee {
  _id?: string
  id?: string
  employeeId?: string
  name: string
  salary?: number
}

interface DashboardStats {
  totalLeaves: number
  pendingLeaves: number
  approvedLeaves: number
  rejectedLeaves: number
  monthlySalary: number
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    monthlySalary: 0,
  })
  const [user, setUser] = useState<Employee | null>(null)
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([])

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData) as Employee)
    }

    // Load real data from API for the logged-in employee
    const load = async () => {
      try {
        const stored = localStorage.getItem("user")
        if (!stored) return
        const u = JSON.parse(stored)
        const employeeId = u._id || u.employeeId || u.id
        if (!employeeId) return

        // Fetch leaves for this employee (server-side filtered)
        const leavesRes = await fetch(`/api/leaves?employeeId=${encodeURIComponent(employeeId)}`)
        const myLeaves: Leave[] = leavesRes.ok ? await leavesRes.json() : []

        // compute counts
        const pending = myLeaves.filter(l => String(l.status).toLowerCase() === "pending").length
        const approved = myLeaves.filter(l => String(l.status).toLowerCase() === "approved").length
        const rejected = myLeaves.filter(l => String(l.status).toLowerCase() === "rejected").length

        // Fetch salaries to compute monthly salary (try salaries collection first)
        const salRes = await fetch(`/api/salary?employeeId=${encodeURIComponent(employeeId)}`)
        const mySalaries: Salary[] = salRes.ok ? await salRes.json() : []
        console.log("Fetched salaries:", mySalaries)

        // find salary agg for current month/year
        const now = new Date()
        const curMonth = now.getMonth() + 1
        const curYear = now.getFullYear()
        let monthlySalary = 0

        // Get latest salary record first
        const sortedSalaries = [...mySalaries].sort((a, b) => {
          const dateA = new Date(Number(a.year), Number(a.month) - 1)
          const dateB = new Date(Number(b.year), Number(b.month) - 1)
          return dateB.getTime() - dateA.getTime()
        })
        console.log("Latest salary record:", sortedSalaries[0])

        const currentMonthSum = sortedSalaries.length > 0 
          ? Number(sortedSalaries[0].netSalary || sortedSalaries[0].net || 0)
          : 0

        console.log("Current month sum:", currentMonthSum)

        if (currentMonthSum > 0) {
          monthlySalary = currentMonthSum
        } else {
          // fallback to employee.salary (assume annual) /12
          const empRes = await fetch(`/api/employees/${encodeURIComponent(employeeId)}`)
          if (empRes.ok) {
            const emp: Employee = await empRes.json()
            // Treat `employee.salary` as the canonical monthly salary value.
            // Previously this code assumed `salary` was annual and divided by 12,
            // which produced 6667 for a stored value of 80000. Use the stored value
            // directly so dashboard matches the admin/employee listing.
            const salaryValue = typeof emp.salary === "number" ? emp.salary : Number(emp.salary || 0)
            monthlySalary = salaryValue || 0
          }
        }

        // sort recent leaves by startDate desc and pick top 5
        myLeaves.sort((a, b) => {
          const da = a.startDate ? new Date(a.startDate).getTime() : 0
          const db = b.startDate ? new Date(b.startDate).getTime() : 0
          return db - da
        })

        setRecentLeaves(myLeaves.slice(0, 5))
        setStats({
          totalLeaves: myLeaves.length,
          pendingLeaves: pending,
          approvedLeaves: approved,
          rejectedLeaves: rejected,
          monthlySalary,
        })
      } catch (err) {
        console.error("Failed to load employee dashboard data:", err)
      }
    }

    load()
  }, [])

  const statCards = [
    {
      title: "Total Leaves",
      value: stats.totalLeaves,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Approved Leaves",
      value: stats.approvedLeaves,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Rejected Leaves",
      value: stats.rejectedLeaves,
      icon: XCircle,
      color: "bg-red-500",
    },
    {
      title: "Monthly Salary",
      value: `₹${stats.monthlySalary.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-teal-500",
    },
  ]

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "apply-leave":
        router.push("/employee/leaves")
        break
      case "update-profile":
        router.push("/employee/profile")
        break
      case "view-salary":
        router.push("/employee/salary")
        break
      default:
        break
    }
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's your dashboard overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                  <div className={`p-2 rounded-full ${card.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Applications</CardTitle>
              <CardDescription>Your latest leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeaves.length === 0 ? (
                  <p className="text-sm text-gray-600">No recent leave applications</p>
                ) : (
                  recentLeaves.map((l) => (
                    <div
                      key={l._id || l.id || `${l.employeeId}-${l.startDate}`}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        String(l.status).toLowerCase() === "pending" ? "bg-yellow-50" : String(l.status).toLowerCase() === "approved" ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{l.leaveType || l.type || "Leave"}</p>
                        <p className="text-sm text-gray-600">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        String(l.status).toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" : String(l.status).toLowerCase() === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {String(l.status).charAt(0).toUpperCase() + String(l.status).slice(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => handleQuickAction("apply-leave")}
                  className="w-full p-3 text-left bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  <p className="font-medium text-teal-700">Apply for Leave</p>
                  <p className="text-sm text-teal-600">Submit a new leave request</p>
                </button>
                <button
                  onClick={() => handleQuickAction("update-profile")}
                  className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <p className="font-medium text-blue-700">Update Profile</p>
                  <p className="text-sm text-blue-600">Edit your personal information</p>
                </button>
                <button
                  onClick={() => handleQuickAction("view-salary")}
                  className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <p className="font-medium text-purple-700">View Salary Details</p>
                  <p className="text-sm text-purple-600">Check your salary breakdown</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeLayout>
  )
}
