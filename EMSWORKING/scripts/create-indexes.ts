import { getDB } from "@/lib/mongodb"

async function createIndexes() {
  try {
    const db = await getDB()
    
    // Employee indexes
    await db.collection("employees").createIndexes([
      { key: { createdAt: 1 }, name: "employees_createdAt" },
      { key: { department: 1 }, name: "employees_department" },
      { key: { employeeId: 1 }, name: "employees_employeeId", unique: true }
    ])
    console.log("✅ Created employee indexes")

    // Attendance indexes
    await db.collection("attendance").createIndexes([
      { key: { date: 1, status: 1 }, name: "attendance_date_status" },
      { key: { status: 1, createdAt: 1 }, name: "attendance_status_createdAt" },
      { key: { employeeId: 1, date: 1 }, name: "attendance_employeeId_date" }
    ])
    console.log("✅ Created attendance indexes")

    // Leave indexes
    await db.collection("leaves").createIndexes([
      { key: { status: 1 }, name: "leaves_status" },
      { key: { createdAt: 1 }, name: "leaves_createdAt" },
      { key: { employeeId: 1, startDate: 1 }, name: "leaves_employeeId_startDate" }
    ])
    console.log("✅ Created leave indexes")

  } catch (error) {
    console.error("Error creating indexes:", error)
  } finally {
    process.exit()
  }
}

createIndexes()