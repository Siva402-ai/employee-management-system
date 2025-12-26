import { NextResponse } from "next/server"
import { type DashboardAnalytics } from "@/lib/mock-data"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDB()
    
    // 1. Employee Overview
    // Get total employees and department-wise count
    // Get employee statistics in a single aggregation
    const employeeStats = await db.collection("employees").aggregate([
      {
        $facet: {
          "totalCount": [{ $count: "total" }],
          "departmentCounts": [
            {
              $group: {
                _id: "$department",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]).toArray()

    // Process employee statistics
    const totalEmployeesFromStats = employeeStats[0]?.totalCount[0]?.total || 0
    const departmentWiseCount: { [key: string]: number } = {}
    employeeStats[0]?.departmentCounts.forEach((dept: { _id?: string; count: number }) => {
      if (dept._id) {
        departmentWiseCount[dept._id] = dept.count
      }
    })

    // Get recently added employees (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentlyAdded = await db.collection("employees")
      .find(
        { createdAt: { $gte: thirtyDaysAgo } },
        { 
          projection: {
            employeeId: 1,
            name: 1,
            email: 1,
            department: 1,
            position: 1,
            salary: 1,
            dateOfBirth: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .then(employees => employees.map(docToObj))

    // Calculate attendance analytics for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyAttendancePipeline = [
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]
    
    const monthlyAttendance = await db.collection("attendance").aggregate(monthlyAttendancePipeline).toArray()
    const attendanceSummary = {
      present: monthlyAttendance.find(a => a._id === "Present")?.count || 0,
      absent: monthlyAttendance.find(a => a._id === "Absent")?.count || 0,
      late: monthlyAttendance.find(a => a._id === "Late")?.count || 0,
      earlyExit: monthlyAttendance.find(a => a._id === "Early Exit")?.count || 0,
    }

    // Generate attendance trends (last 7 days)
    const attendanceTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayAttendanceResult = await db.collection("attendance").aggregate([
        {
          $match: {
            date: dateStr
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]).toArray()

      attendanceTrends.push({
        date: dateStr,
        present: dayAttendanceResult.find(a => a._id === "Present")?.count || 0,
        absent: dayAttendanceResult.find(a => a._id === "Absent")?.count || 0
      })
    }

    // Calculate frequent absences (employees with most absences)
    const frequentAbsencesPipeline = [
      {
        $match: {
          status: "Absent",
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: {
            employeeId: "$employeeId",
            employeeName: "$employeeName"
          },
          absenceCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          employeeId: "$_id.employeeId",
          employeeName: "$_id.employeeName",
          absenceCount: 1
        }
      },
      {
        $sort: { absenceCount: -1 }
      },
      {
        $limit: 5
      }
    ]

    const frequentAbsences = await db.collection("attendance").aggregate(frequentAbsencesPipeline).toArray()

    // Calculate leave analytics
    const leaveStatusPipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]
    
    const leaveStatusResults = await db.collection("leaves").aggregate(leaveStatusPipeline).toArray()
    const leaveStatusOverview = {
      pending: leaveStatusResults.find(l => l._id === "pending")?.count || 0,
      approved: leaveStatusResults.find(l => l._id === "approved")?.count || 0,
      rejected: leaveStatusResults.find(l => l._id === "rejected")?.count || 0,
    }

    // Generate leave trends (last 6 months)
    const leaveTrendsPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) // Last 6 months
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          leaves: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const rawLeaveTrends = await db.collection("leaves").aggregate(leaveTrendsPipeline).toArray()
    const leaveTrends = rawLeaveTrends.map(item => ({
      month: monthNames[item._id.month - 1],
      leaves: item.leaves
    }))

    // Map MongoDB documents to expected types (preserve _id for React keys)
    const mappedRecentlyAdded = recentlyAdded.map(emp => ({
      _id: (emp as any)._id ?? (emp as any).id,
      id: (emp as any).id ?? (emp as any)._id,
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      dateOfBirth: emp.dateOfBirth,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }))

    const analytics: DashboardAnalytics = {
      employeeOverview: {
        totalEmployees: totalEmployeesFromStats,
        departmentWiseCount,
        recentlyAdded: mappedRecentlyAdded,
      },
      attendanceAnalytics: {
        monthlyAttendanceSummary: attendanceSummary,
        attendanceTrends,
        frequentAbsences: frequentAbsences as Array<{
          employeeId: string;
          employeeName: string;
          absenceCount: number;
        }>,
      },
      leaveAnalytics: {
        leaveStatusOverview,
        leaveTrends,
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
