import { getDB } from "@/lib/mongodb"

async function cleanupOldData() {
  try {
    const db = await getDB()
    const now = new Date()

    // Keep only last 12 months of attendance records
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)
    const attendanceResult = await db.collection("attendance").deleteMany({
      createdAt: { $lt: twelveMonthsAgo }
    })
    console.log(`✅ Deleted ${attendanceResult.deletedCount} old attendance records`)

    // Archive old leaves (completed/rejected > 6 months old)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    
    // Get old leaves
    const oldLeaves = await db.collection("leaves")
      .find({
        status: { $in: ["approved", "rejected"] },
        createdAt: { $lt: sixMonthsAgo }
      })
      .toArray()

    // Insert into archive if there are old leaves
    if (oldLeaves.length > 0) {
      await db.collection("leaves_archive").insertMany(oldLeaves)
      console.log(`✅ Archived ${oldLeaves.length} old leave records`)

      // Delete from main collection
      const leavesResult = await db.collection("leaves").deleteMany({
        _id: { $in: oldLeaves.map(leave => leave._id) }
      })
      console.log(`✅ Removed ${leavesResult.deletedCount} archived leaves from main collection`)
    } else {
      console.log("No old leaves to archive")
    }

  } catch (error) {
    console.error("Error cleaning up old data:", error)
  } finally {
    process.exit()
  }
}

cleanupOldData()