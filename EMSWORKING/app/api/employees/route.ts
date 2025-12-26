import { NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDB()
    const employees = await db.collection("employees").find({}).toArray()
    const objs = employees.map(docToObj).map((e: any) => {
      if (e && e.password) delete e.password
      return e
    })

    return NextResponse.json(objs)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ Add new employee
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Make sure salary is a number
    const employee = {
      employeeId: body.employeeId,
      name: body.name,
      email: body.email?.toLowerCase(),
      password: "employee123", // Default password that employees can change later
      role: "employee",
      dateOfBirth: body.dateOfBirth,
      department: body.department,
      position: body.position,
      salary: Number(body.salary) || 0,
      image: body.image || null,
      createdAt: new Date(),
    }

    const db = await getDB()

    const result = await db.collection("employees").insertOne(employee)

    const created = { id: result.insertedId.toString(), ...employee }
    if ((created as any).password) delete (created as any).password
    return NextResponse.json({
      employee: created,
    })
  } catch (error: any) {
    console.error("POST /employees error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
