import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const departmentId = params.id;
    const db = await getDB();
  const result = await db.collection("departments").deleteOne({ _id: new ObjectId(departmentId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Department not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const updates = await request.json();
    const db = await getDB();
    const { name, description } = updates;
    const result = await db.collection("departments").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    if (!result || !result.value) {
      return NextResponse.json({ success: false, message: "Department not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, department: docToObj(result.value) });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
