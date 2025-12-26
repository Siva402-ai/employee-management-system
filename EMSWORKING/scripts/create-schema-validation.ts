import { getDB } from "@/lib/mongodb"

async function createSchemaValidation() {
  try {
    const db = await getDB()

    // Employee Schema
    await db.command({
      collMod: "employees",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["employeeId", "name", "email", "department", "position", "createdAt", "updatedAt"],
          properties: {
            employeeId: { bsonType: "string" },
            name: { bsonType: "string" },
            email: { bsonType: "string" },
            dateOfBirth: { bsonType: "string" },
            department: { bsonType: "string" },
            position: { bsonType: "string" },
            salary: { bsonType: "number" },
            image: { bsonType: ["string", "null"] },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      },
      validationLevel: "moderate"
    })
    console.log("✅ Added employee schema validation")

    // Attendance Schema
    await db.command({
      collMod: "attendance",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["employeeId", "employeeName", "date", "status", "createdAt"],
          properties: {
            employeeId: { bsonType: "string" },
            employeeName: { bsonType: "string" },
            department: { bsonType: "string" },
            date: { bsonType: "string" },
            punchIn: { bsonType: ["string", "null"] },
            punchOut: { bsonType: ["string", "null"] },
            totalHours: { bsonType: ["number", "null"] },
            status: { 
              enum: ["Present", "Absent", "Late", "Early Exit"]
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      },
      validationLevel: "moderate"
    })
    console.log("✅ Added attendance schema validation")

    // Leave Schema
    await db.command({
      collMod: "leaves",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["employeeId", "employeeName", "leaveType", "startDate", "endDate", "status", "createdAt"],
          properties: {
            employeeId: { bsonType: "string" },
            employeeName: { bsonType: "string" },
            leaveType: { bsonType: "string" },
            startDate: { bsonType: "string" },
            endDate: { bsonType: "string" },
            reason: { bsonType: "string" },
            status: {
              enum: ["pending", "approved", "rejected"]
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      },
      validationLevel: "moderate"
    })
    console.log("✅ Added leave schema validation")

  } catch (error) {
    console.error("Error creating schema validation:", error)
  } finally {
    process.exit()
  }
}

createSchemaValidation()