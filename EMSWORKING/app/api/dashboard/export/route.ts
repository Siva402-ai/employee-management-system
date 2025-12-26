import { NextResponse } from "next/server"
import { mockEmployees, mockAttendance, mockLeaves } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "employees"

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "employees":
        data = mockEmployees.map((emp) => ({
          "Employee ID": emp.employeeId,
          Name: emp.name,
          Email: emp.email,
          Department: emp.department,
          Position: emp.position,
          Salary: emp.salary,
          "Date of Birth": emp.dateOfBirth,
        }))
        filename = "employees_export.csv"
        break

      case "attendance":
        data = mockAttendance.map((att) => ({
          "Employee ID": att.employeeId,
          "Employee Name": att.employeeName,
          Department: att.department,
          Date: att.date,
          "Punch In": att.punchIn || "N/A",
          "Punch Out": att.punchOut || "N/A",
          "Total Hours": att.totalHours || "N/A",
          Status: att.status,
        }))
        filename = "attendance_export.csv"
        break

      case "leaves":
        data = mockLeaves.map((leave) => ({
          "Employee ID": leave.employeeId,
          "Employee Name": leave.employeeName,
          "Leave Type": leave.leaveType,
          "Start Date": leave.startDate,
          "End Date": leave.endDate,
          Reason: leave.reason,
          Status: leave.status,
        }))
        filename = "leaves_export.csv"
        break

      default:
        return NextResponse.json({ success: false, message: "Invalid export type" }, { status: 400 })
    }

    // Convert to CSV
    if (data.length === 0) {
      return NextResponse.json({ success: false, message: "No data to export" }, { status: 400 })
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
