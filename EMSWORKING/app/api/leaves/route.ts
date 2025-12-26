import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB, docToObj } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get("employeeId")
    const db = await getDB();

    const query: any = {}
    if (employeeId) {
      // Accept either stored formats (employeeId or Mongo _id string saved in employeeId field)
      query.employeeId = employeeId
    }

    const leaves = await db.collection("leaves").find(query).toArray();
    return NextResponse.json(leaves.map(docToObj));
  } catch (error) {
    console.error("GET /api/leaves error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const leaveData = await request.json();
    console.log("Received leave data:", leaveData); // Debug log

    // Validate required fields
    const requiredFields = ['employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'reason'];
    const missingFields = requiredFields.filter(field => !leaveData[field]);
    
    if (missingFields.length > 0) {
      console.warn("POST /api/leaves missing required fields:", missingFields);
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate date formats
    try {
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
      if (endDate < startDate) {
        return NextResponse.json({
          success: false,
          message: "End date cannot be before start date"
        }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: "Invalid date format provided"
      }, { status: 400 });
    }
    
    const db = await getDB();

    // Validate employee exists - check employeeId as string
    const employeeIdStr = leaveData.employeeId.toString().trim();
    const employee = await db.collection("employees").findOne({ 
      employeeId: employeeIdStr
    });

    console.log("Found employee:", employee);

    // Also log existing leaves for this employee to help diagnose false-positive overlaps
    try {
      const existingLeaves = await db.collection("leaves").find({ employeeId: employeeIdStr }).toArray();
      console.log(`Existing leaves for employeeId=${employeeIdStr}:`, existingLeaves.map(doc => ({ _id: doc._id?.toString(), startDate: doc.startDate, endDate: doc.endDate, status: doc.status })));
    } catch (listErr) {
      console.warn("Failed to list existing leaves for debug:", listErr);
    }

    if (!employee) {
      console.error("Employee not found in database:", employeeIdStr);
      return NextResponse.json({ 
        success: false, 
        message: "Employee not found. Please ensure you are logged in with a valid employee account." 
      }, { status: 400 });
    }

    // Check for overlapping leaves using robust overlap condition:
    // overlap exists when existing.startDate <= newEnd && existing.endDate >= newStart
    const newStart = new Date(leaveData.startDate);
    const newEnd = new Date(leaveData.endDate);

    console.log("Checking overlap for employeeId:", leaveData.employeeId, { newStart, newEnd });

    // Load candidate existing leaves and check overlap in JS to avoid mixed-type issues
    const candidates = await db.collection("leaves").find({
      employeeId: leaveData.employeeId.toString(),
      status: { $in: ["pending", "approved"] }
    }).toArray();

    console.log("Candidate leaves to check for overlap:", candidates.map(c => ({ _id: c._id?.toString(), startDate: c.startDate, endDate: c.endDate, status: c.status })));

    const overlapping = candidates.find((c) => {
      // coerce stored values to Date if possible
      const existingStart = c.startDate ? new Date(c.startDate) : null;
      const existingEnd = c.endDate ? new Date(c.endDate) : null;
      if (!existingStart || !existingEnd) return false;

      // overlap exists when existingStart <= newEnd && existingEnd >= newStart
      return existingStart <= newEnd && existingEnd >= newStart;
    });

    if (overlapping) {
      console.log("Found overlapping leave (JS check):", overlapping);
      return NextResponse.json(
        { success: false, message: "Employee already has approved/pending leave for this period", overlapping: docToObj(overlapping) },
        { status: 400 }
      );
    }

    const newLeave = {
      employeeId: leaveData.employeeId.toString(),
      employeeName: leaveData.employeeName,
      leaveType: leaveData.leaveType || leaveData.type,
      startDate: new Date(leaveData.startDate),
      endDate: new Date(leaveData.endDate),
      reason: leaveData.reason,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Saving new leave:", newLeave); // Debug log

    const result = await db.collection("leaves").insertOne(newLeave);
    console.log("Insert result:", result); // Debug log

    // Backfill a string 'id' field for easier client-side lookups (helps older code that used 'id')
    try {
      await db.collection("leaves").updateOne(
        { _id: result.insertedId },
        { $set: { id: result.insertedId.toString() } }
      );
    } catch (backfillErr) {
      console.warn("Failed to backfill 'id' field on inserted leave:", backfillErr);
    }

    const inserted = await db.collection("leaves").findOne({ _id: result.insertedId });
    console.log("Inserted document:", inserted); // Debug log

    return NextResponse.json({ 
      success: true, 
      leave: inserted ? docToObj(inserted) : null 
    });
  } catch (error) {
    console.error("POST /api/leaves error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
