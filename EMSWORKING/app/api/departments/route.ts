import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDB();
    const departments = await db.collection("departments").find({}).toArray();
    return NextResponse.json(departments.map(docToObj));
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const departmentData = await request.json();
    const db = await getDB();
    const result = await db.collection("departments").insertOne({
      ...departmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const newDepartment = await db.collection("departments").findOne({ _id: result.insertedId });
    if (!newDepartment) {
      return NextResponse.json({ success: false, message: "Failed to create department" }, { status: 500 })
    }
    return NextResponse.json({ success: true, department: docToObj(newDepartment) });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
