import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get("employeeId")
    const db = await getDB();

    const query: any = {}
    if (employeeId) query.employeeId = employeeId

    const salaries = await db.collection("salaries").find(query).toArray();
    return NextResponse.json(salaries.map(docToObj));
  } catch (error) {
    console.error("GET /api/salary error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const salaryData = await request.json();
    const db = await getDB();
    const newSalary = {
      ...salaryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("salaries").insertOne(newSalary);
  const inserted = await db.collection("salaries").findOne({ _id: result.insertedId });
  return NextResponse.json({ success: true, salary: inserted ? docToObj(inserted) : null });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
