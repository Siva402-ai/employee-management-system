import { getDB } from "@/lib/mongodb"

async function migrateData() {
  try {
    const db = await getDB()
    const now = new Date()

    // 1. Fix employee data
    const employeeUpdates = await db.collection("employees").updateMany(
      { createdAt: { $exists: false } },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    )
    console.log(`✅ Fixed ${employeeUpdates.modifiedCount} employee records`)

    // 2. Fix attendance data
    // Ensure date field is in YYYY-MM-DD format
    const attendanceDocs = await db.collection("attendance")
      .find({ date: { $type: "date" } })
      .toArray()

    for (const doc of attendanceDocs) {
      await db.collection("attendance").updateOne(
        { _id: doc._id },
        {
          $set: {
            date: doc.date.toISOString().split('T')[0],
            updatedAt: now
          }
        }
      )
    }
    console.log(`✅ Fixed ${attendanceDocs.length} attendance dates`)

    // Fix missing status values
    const statusUpdates = await db.collection("attendance").updateMany(
      { status: { $exists: false } },
      {
        $set: {
          status: "Present",
          updatedAt: now
        }
      }
    )
    console.log(`✅ Fixed ${statusUpdates.modifiedCount} attendance status records`)

    // 3. Fix leaves data
    // Convert any startDate/endDate that are Date objects to YYYY-MM-DD strings
    const leaveDocs = await db.collection("leaves")
      .find({
        $or: [
          { startDate: { $type: "date" } },
          { endDate: { $type: "date" } }
        ]
      })
      .toArray()

    for (const doc of leaveDocs) {
      await db.collection("leaves").updateOne(
        { _id: doc._id },
        {
          $set: {
            startDate: doc.startDate instanceof Date ? doc.startDate.toISOString().split('T')[0] : doc.startDate,
            endDate: doc.endDate instanceof Date ? doc.endDate.toISOString().split('T')[0] : doc.endDate,
            updatedAt: now
          }
        }
      )
    }
    console.log(`✅ Fixed ${leaveDocs.length} leave dates`)

    // Fix missing status values
    const leaveStatusUpdates = await db.collection("leaves").updateMany(
      { status: { $exists: false } },
      {
        $set: {
          status: "pending",
          updatedAt: now
        }
      }
    )
    console.log(`✅ Fixed ${leaveStatusUpdates.modifiedCount} leave status records`)

  } catch (error) {
    console.error("Error migrating data:", error)
  } finally {
    process.exit()
  }
}

migrateData()