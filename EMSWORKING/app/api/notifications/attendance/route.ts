import { type NextRequest, NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get("employeeId")
    const db = await getDB();
    // Build aggregation pipeline to optionally filter and look up employee details
    const matchStage: any = {}
    if (employeeId) matchStage.employeeId = employeeId

    const pipeline: any[] = []
    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage })

    // Lookup employee document by either business employeeId or by matching stringified _id
    pipeline.push({
      $lookup: {
        from: "employees",
        let: { empId: "$employeeId" },
        pipeline: [
          { $addFields: { _idStr: { $toString: "$_id" } } },
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$employeeId", "$$empId"] },
                  { $eq: ["$_idStr", "$$empId"] }
                ]
              }
            }
          },
          { $project: { _id: 1, employeeId: 1, name: 1, department: 1 } }
        ],
        as: "employee"
      }
    })

    pipeline.push({ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } })

    const attendance = await db.collection("attendance").aggregate(pipeline).toArray();

    // Normalize and enrich response: convert root doc _id to string and attach a preferred business id
    const normalized = attendance.map((doc: any) => {
      const out = docToObj(doc as any) as any
      if (doc.employee) {
        // prefer the business employeeId from employees collection
        out.employeeBusinessId = doc.employee.employeeId || (doc.employee._id ? doc.employee._id.toString() : undefined)
        // ensure name/department populated from employee if missing on attendance doc
        out.employeeName = out.employeeName || doc.employee.name
        out.department = out.department || doc.employee.department
      }
      return out
    })

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeId, employeeName, department } = body;
    const db = await getDB();
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (action === "punchIn") {
      if (!employeeId) {
        return NextResponse.json({ error: "employeeId is required" }, { status: 400 })
      }
      // Check if already punched in today for this employee
      const existing = await db.collection("attendance").findOne({ employeeId, date: today });
      if (existing) {
        return NextResponse.json({ error: "Already punched in today" }, { status: 400 });
      }
      // Determine status based on punch in time
      const punchInHour = new Date().getHours();
      let status: "Present" | "Late" = "Present";
      if (punchInHour >= 9) status = "Late";
      const newRecord = {
        employeeId,
        employeeName,
        department,
        date: today,
        punchIn: currentTime,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection("attendance").insertOne(newRecord);
      const inserted = await db.collection("attendance").findOne({ _id: result.insertedId });
  return NextResponse.json({ attendance: inserted ? docToObj(inserted) : null });
    }

    if (action === "punchOut") {
      if (!employeeId) {
        return NextResponse.json({ error: "employeeId is required" }, { status: 400 })
      }
      // Find the latest open attendance record for this employee for today (no punchOut yet)
      const record = await db.collection("attendance").findOne({ employeeId, date: today, punchOut: { $exists: false } });
      if (!record) {
        return NextResponse.json({ error: "No open punch in record found for today" }, { status: 400 });
      }
      if (record.punchOut) {
        return NextResponse.json({ error: "Already punched out today" }, { status: 400 });
      }
      // Calculate total hours
      const punchInTime = new Date(`${today}T${record.punchIn}:00`);
      const punchOutTime = new Date(`${today}T${currentTime}:00`);
      const totalHours = Math.round(((punchOutTime.getTime() - punchInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;
      // Update status based on total hours
      let status = record.status;
      if (totalHours < 8) status = "Early Exit";
      const update = await db.collection("attendance").findOneAndUpdate(
        { _id: record._id },
        { $set: { punchOut: currentTime, totalHours, status, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
      return NextResponse.json({ attendance: update && update.value ? docToObj(update.value) : null });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing attendance:", error);
    return NextResponse.json({ error: "Failed to process attendance" }, { status: 500 });
  }
}
