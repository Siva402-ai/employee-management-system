import { NextResponse } from "next/server"
import { getDB } from "@/lib/mongodb"

// Return dashboard summary stats computed from MongoDB
export async function GET() {
  try {
    const db = await getDB()

    const now = new Date()
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthName = monthNames[now.getMonth()]
    const year = now.getFullYear()

    // total employees and departments
    const [totalEmployees, totalDepartments] = await Promise.all([
      db.collection("employees").countDocuments(),
      db.collection("departments").countDocuments(),
    ])

    // Try to compute monthly payroll from `salaries` collection for current month/year
    let monthlySalary = 0
    const salaryAgg = await db.collection("salaries").aggregate([
      { $match: { year: year, month: monthName } },
      { $group: { _id: null, total: { $sum: "$netSalary" } } }
    ]).toArray()

    if (salaryAgg[0] && salaryAgg[0].total) {
      monthlySalary = salaryAgg[0].total
    } else {
      // Fallback: sum employee annual salaries and divide by 12
      const empSalaryAgg = await db.collection("employees").aggregate([
        { $group: { _id: null, totalAnnual: { $sum: "$salary" } } }
      ]).toArray()
      const totalAnnual = empSalaryAgg[0]?.totalAnnual || 0
      monthlySalary = Math.round(totalAnnual / 12)
    }

    // Leaves counts
    const leaveAgg = await db.collection("leaves").aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray()

    const applied = leaveAgg.reduce((s, r) => s + (r.count || 0), 0)
    const approved = leaveAgg.find(l => l._id === "approved")?.count || 0
    const pending = leaveAgg.find(l => l._id === "pending")?.count || 0
    const rejected = leaveAgg.find(l => l._id === "rejected")?.count || 0

    const stats = {
      totalEmployees,
      totalDepartments,
      monthlySalary,
      leaves: {
        applied,
        approved,
        pending,
        rejected,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error computing dashboard stats:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
