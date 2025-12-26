import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET /api/employees/:id - fetch single employee by _id or employeeId
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const db = await getDB()

    const query = id && id.match(/^[0-9a-fA-F]{24}$/) ? { _id: new ObjectId(id) } : { employeeId: id }

    const employee = await db.collection("employees").findOne(query)
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })

    const obj = docToObj(employee)
    if (obj && (obj as any).password) delete (obj as any).password

    return NextResponse.json(obj)
  } catch (error: any) {
    console.error("GET /api/employees/[id] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/employees/:id - delete employee by _id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const db = await getDB()
    const result = await db.collection("employees").deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("DELETE /api/employees/[id] error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// PATCH /api/employees/:id - update employee
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()
    const db = await getDB()
    const result = await db.collection("employees").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    )
    if (!result || !result.value) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }
    const emp = docToObj(result.value)
    if (emp && (emp as any).password) delete (emp as any).password
    return NextResponse.json({ success: true, employee: emp })
  } catch (error: any) {
    console.error("PATCH /api/employees/[id] error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
