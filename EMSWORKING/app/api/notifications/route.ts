import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDB()
    
    // Aggregate attendance anomalies
    const now = new Date()
    const threeDaysAgo = new Date(now)
    threeDaysAgo.setDate(now.getDate() - 3)
    
    // First get recent attendance records
    const attendanceRecords = await db.collection("attendance").aggregate([
      {
        $match: {
          status: "Absent",
          date: { $gte: threeDaysAgo.toISOString().split('T')[0] }
        }
      },
      {
        $group: {
          _id: "$employeeId",
          employeeName: { $first: "$employeeName" },
          absenceDates: { $push: "$date" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // employees absent 2 or more days
        }
      },
      // Lookup employee details
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "employeeId",
          as: "employeeDetails"
        }
      }
    ]).toArray()

    const notifications = [];

    // Create attendance notifications
    for (const record of attendanceRecords) {
      const employeeName = record.employeeDetails?.[0]?.name || record.employeeName
      notifications.push({
        _id: record._id,
        type: "attendance_anomaly",
        title: "Attendance Alert",
        message: `${employeeName} has been absent for ${record.count} days recently (${record.absenceDates.join(", ")})`,
        employeeId: record._id,
        employeeName: employeeName,
        priority: record.count >= 3 ? "high" : "medium",
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Get pending leave requests
    const pendingLeaves = await db.collection("leaves")
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray()

    // Add leave notifications
    for (const leave of pendingLeaves) {
      notifications.push({
        _id: leave._id,
        type: "leave_request",
        title: "New Leave Request",
        message: `${leave.employeeName} has requested ${leave.leaveType} from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        priority: "medium",
        read: false,
        createdAt: leave.createdAt,
        updatedAt: leave.updatedAt
      })
    }

    // Sort notifications by priority and date
    notifications.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json(notifications.map(docToObj))
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, read } = await request.json()
    const db = await getDB()

    const result = await db.collection("notifications").updateOne(
      { _id: notificationId },
      { 
        $set: { 
          read,
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ 
      success: result.modifiedCount > 0,
      message: result.modifiedCount > 0 ? "Notification updated" : "No notification found"
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
