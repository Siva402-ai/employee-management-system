import { type NextRequest, NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const projectId = params.id;
    const db = await getDB();
    const result = await db.collection("projects").findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result || !result.value) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Project updated successfully",
      project: docToObj(result.value),
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const db = await getDB();
    const result = await db.collection("projects").deleteOne({ _id: new ObjectId(projectId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
