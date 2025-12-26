import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"
import { createIdQuery } from "@/lib/db-utils"
import { ObjectId } from "mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const leaveId = params.id
    console.log("[API] Starting leave status update for ID:", leaveId)

    const body = await request.json()
    const { status } = body

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status. Must be 'pending', 'approved', or 'rejected'" },
        { status: 400 }
      )
    }

    const db = await getDB()

    try {
      const query = createIdQuery(leaveId)
      console.log("[API] Using query for update:", query)

      // First try to find the document to update
      // First find the document
      const existingLeave = await db.collection("leaves").findOne(query);
      if (!existingLeave) {
        console.warn("[API] Leave not found using initial query:", query);
        return NextResponse.json({ success: false, message: "Leave application not found" }, { status: 404 });
      }

      console.log("[API] Found leave to update:", existingLeave._id.toString());

      // Perform update with write concern for consistency
      // Perform the update
      const updateResult = await db.collection("leaves").findOneAndUpdate(
        { _id: existingLeave._id }, // Use exact _id match
        {
          $set: {
            status,
            updatedAt: new Date(),
            processedAt: new Date(),
          },
        },
        { 
          returnDocument: "after"
        }
      );

      if (!updateResult || !updateResult.value) {
        console.error("[API] Update failed - no document returned");
        return NextResponse.json({ success: false, message: "Failed to update leave status" }, { status: 500 });
      }

      // Do an immediate verify read to ensure update is visible
      const verifyDoc = await db.collection("leaves").findOne({ _id: existingLeave._id });
      if (!verifyDoc || verifyDoc.status !== status) {
        console.error("[API] Update verification failed - status mismatch");
        return NextResponse.json({ success: false, message: "Failed to verify leave status update" }, { status: 500 });
      }

      // Convert the document for client consumption
      if (!updateResult || !updateResult.value) {
        console.warn("[API] Leave not found for ID:", leaveId)
        // If the regular query didn't match, attempt a safe fallback search
        // (some records may have inconsistent id fields). We'll try:
        // 1) direct _id lookup (if leaveId is a valid ObjectId)
        // 2) string `id` field lookup
        // 3) aggregation matching _id string
        let candidate: any = null

        try {
          const maybeObjId = (() => { try { return new ObjectId(leaveId) } catch { return null } })()
          if (maybeObjId) {
            candidate = await db.collection('leaves').findOne({ _id: maybeObjId })
            console.log('[API] fallback - find by _id result:', candidate ? candidate._id?.toString() : null)
          }
        } catch (e) {
          console.warn('[API] fallback - error finding by _id', e)
        }

        if (!candidate) {
          try {
            candidate = await db.collection('leaves').findOne({ id: leaveId })
            console.log('[API] fallback - find by string id result:', candidate ? candidate._id?.toString() : null)
          } catch (e) {
            console.warn('[API] fallback - error finding by string id', e)
          }
        }

        if (!candidate) {
          try {
            const agg = await db.collection('leaves').aggregate([
              { $project: { _id: 1, id: 1, _idStr: { $toString: '$_id' } } },
              { $match: { _idStr: leaveId } },
              { $limit: 1 }
            ]).toArray()
            if (agg && agg[0]) {
              candidate = await db.collection('leaves').findOne({ _id: new ObjectId(agg[0]._id) })
            }
            console.log('[API] fallback - aggregation _idStr match:', candidate ? candidate._id?.toString() : null)
          } catch (e) {
            console.warn('[API] fallback - aggregation error', e)
          }
        }

        if (candidate && candidate._id) {
          try {
            const fallbackUpdate = await db.collection('leaves').findOneAndUpdate(
              { _id: candidate._id },
              { $set: { status, updatedAt: new Date(), processedAt: new Date() } },
              { returnDocument: 'after' }
            )

            if (fallbackUpdate && fallbackUpdate.value) {
              console.log('[API] fallback update succeeded for _id:', fallbackUpdate.value._id?.toString())
              return NextResponse.json({ success: true, message: `Leave application has been ${status} (fallback)`, leave: docToObj(fallbackUpdate.value) })
            }
          } catch (e) {
            console.error('[API] error during fallback update:', e)
            return NextResponse.json({ success: false, message: 'Database error while updating leave (fallback)', error: String(e) }, { status: 500 })
          }
        }

        return NextResponse.json({ success: false, message: "Leave application not found" }, { status: 404 })
      }

      const responseData = docToObj(updateResult.value)
      return NextResponse.json({ success: true, message: `Leave application has been ${status}`, leave: responseData })
    } catch (dbError) {
      console.error("[API] DB error while updating leave:", dbError)
      return NextResponse.json({ success: false, message: "Database error while updating leave", error: String(dbError) }, { status: 500 })
    }
  } catch (err) {
    console.error("[API] Unexpected error in PATCH /api/leaves/[id]:", err)
    return NextResponse.json({ success: false, message: "Failed to update leave status" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const leaveId = params.id
    console.log('[API] DELETE leave request for ID:', leaveId)

    const db = await getDB()
    try {
      const query = createIdQuery(leaveId)
      console.log('[API] Using query for delete:', query)

      const result = await db.collection('leaves').findOneAndDelete(query)

      if (!result || !result.value) {
        console.warn('[API] Leave not found for delete ID:', leaveId)

        // Perform diagnostics but keep results so we can attempt a safe fallback delete
        let byObjectId: any = null
        let byStringId: any = null
        let regexMatches: any[] = []
        let aggMatches: any[] = []

        // try find by _id (only if valid ObjectId)
        try {
          const maybeObjId = (() => {
            try { return new ObjectId(leaveId) } catch { return null }
          })()

          if (maybeObjId) {
            try {
              byObjectId = await db.collection('leaves').findOne({ _id: maybeObjId })
              console.log('[API] diagnostic - find by _id result:', byObjectId ? byObjectId._id?.toString() : null)
            } catch (innerErr) {
              console.warn('[API] diagnostic - find by _id threw error:', innerErr)
            }
          } else {
            console.log('[API] diagnostic - provided id is not a valid ObjectId')
          }
        } catch (diagErr) {
          console.warn('[API] diagnostic (outer) - unexpected error:', diagErr)
        }

        // try find by string id field
        try {
          byStringId = await db.collection('leaves').findOne({ id: leaveId })
          console.log('[API] diagnostic - find by string id result:', byStringId ? byStringId._id?.toString() : null)
        } catch (diagErr) {
          console.warn('[API] diagnostic - find by string id threw error:', diagErr)
        }

        // Additional diagnostics: sample some docs and try regex/aggregation searches
        try {
          const sample = await db.collection('leaves').find({}, { projection: { _id: 1, id: 1 } }).limit(20).toArray()
          console.log('[API] diagnostic - sample leaves (first 20):', sample.map(d => ({ _id: d._id?.toString(), id: d.id })))
        } catch (sampleErr) {
          console.warn('[API] diagnostic - failed to sample leaves:', sampleErr)
        }

        try {
          // escape leaveId for regex
          const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")
          const idRegex = new RegExp(escapeRegex(leaveId))
          regexMatches = await db.collection('leaves').find({ id: { $regex: idRegex } }, { projection: { _id: 1, id: 1 } }).limit(20).toArray()
          console.log('[API] diagnostic - find by id regex matches:', regexMatches.map(d => ({ _id: d._id?.toString(), id: d.id })))
        } catch (regexErr) {
          console.warn('[API] diagnostic - id regex search threw error:', regexErr)
        }

        try {
          // aggregation: project _id to string and match substring
          aggMatches = await db.collection('leaves').aggregate([
            { $project: { _id: 1, id: 1, _idStr: { $toString: "$_id" } } },
            { $match: { _idStr: { $regex: leaveId } } },
            { $limit: 20 },
          ]).toArray()
          console.log('[API] diagnostic - aggregation _idStr matches:', aggMatches.map(d => ({ _id: d._id?.toString(), id: d.id, _idStr: d._idStr })))
        } catch (aggErr) {
          console.warn('[API] diagnostic - aggregation _idStr search threw error:', aggErr)
        }

        // If any candidate was found, attempt a safe delete by its actual _id
        const candidate = byObjectId || byStringId || (regexMatches && regexMatches[0]) || (aggMatches && aggMatches[0])
        if (candidate && candidate._id) {
          try {
            console.log('[API] Attempting fallback delete using found candidate _id:', candidate._id?.toString())
            const fallbackResult = await db.collection('leaves').findOneAndDelete({ _id: candidate._id })
            if (fallbackResult && fallbackResult.value) {
              console.log('[API] Fallback delete succeeded for _id:', fallbackResult.value._id?.toString())
              return NextResponse.json({ success: true, message: 'Leave deleted (fallback)', leave: docToObj(fallbackResult.value) })
            } else {
              console.warn('[API] Fallback delete attempted but no document was removed for candidate _id:', candidate._id?.toString())
            }
          } catch (fallbackErr) {
            console.error('[API] error while attempting fallback delete:', fallbackErr)
            return NextResponse.json({ success: false, message: 'Database error while deleting leave (fallback)', error: String(fallbackErr) }, { status: 500 })
          }
        }

        // No candidate or fallback delete failed — return 404
        return NextResponse.json({ success: false, message: 'Leave application not found' }, { status: 404 })
      }

      console.log('[API] Deleted leave:', result.value._id?.toString())
      return NextResponse.json({ success: true, message: 'Leave deleted', leave: docToObj(result.value) })
    } catch (dbError) {
      console.error('[API] DB error while deleting leave:', dbError)
      return NextResponse.json({ success: false, message: 'Database error while deleting leave', error: String(dbError) }, { status: 500 })
    }
  } catch (err) {
    console.error('[API] Unexpected error in DELETE /api/leaves/[id]:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete leave' }, { status: 500 })
  }
}
