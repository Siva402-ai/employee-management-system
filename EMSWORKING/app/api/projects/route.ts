import { type NextRequest, NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const db = await getDB();
    let query = {};
    if (employeeId) {
      query = { assignedTo: employeeId };
    }
    const projects = await db.collection("projects").find(query).toArray();
    return NextResponse.json(projects.map(docToObj));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, title, description, assignedTo, assignedToName, deadline, status } = body;
    const db = await getDB();
    // Check if project ID already exists
    const existingProject = await db.collection("projects").findOne({ projectId });
    if (existingProject) {
      return NextResponse.json({ error: "Project ID already exists" }, { status: 400 });
    }
    const newProject = {
      projectId,
      title,
      description,
      assignedTo,
      assignedToName,
      deadline,
      status,
      createdAt: new Date().toISOString(),
      files: [],
    };
    const result = await db.collection("projects").insertOne(newProject);
    const inserted = await db.collection("projects").findOne({ _id: result.insertedId });
    return NextResponse.json(
      {
        message: "Project created successfully",
        project: inserted ? docToObj(inserted) : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
