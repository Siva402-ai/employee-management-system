import { NextResponse } from "next/server"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDB();
    const result = await db.collection("salaries").deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Salary not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json();
    const db = await getDB();
    const result = await db.collection("salaries").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result || !result.value) {
      return NextResponse.json({ success: false, message: "Salary not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, salary: result.value });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
