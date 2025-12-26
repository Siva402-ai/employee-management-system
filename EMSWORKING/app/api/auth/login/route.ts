import { type NextRequest, NextResponse } from "next/server"
import { getDB, docToObj } from "@/lib/mongodb"

// Admin credentials - in production, use environment variables
const ADMIN_EMAIL = "admin@company.com"
const ADMIN_PASSWORD = "admin123"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt:", { email, password });

    // Always convert email to lowercase for comparison
    const lowercaseEmail = email.toLowerCase();

    // Check for admin login
    if (lowercaseEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = "mock-jwt-token-admin-" + Date.now()
      const user = {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "admin",
      }

      return NextResponse.json({
        success: true,
        token,
        user,
      })
    }

    // Check for employee login
    const db = await getDB()
    console.log("Checking employee login for email:", email.toLowerCase());
    const employee = await db.collection("employees").findOne({ email: email.toLowerCase() })
    console.log("Found employee:", employee);
    
    if (employee) {
      console.log("Password comparison:", {
        provided: password,
        stored: employee.password,
        matches: employee.password === password
      });
    }
    
    if (employee && employee.password === password) {
      const token = "mock-jwt-token-employee-" + Date.now()
      const userObj: any = { ...docToObj(employee), role: "employee" }
      // Remove sensitive fields
      if (userObj.password) delete userObj.password

      return NextResponse.json({
        success: true,
        token,
        user: userObj,
      })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
