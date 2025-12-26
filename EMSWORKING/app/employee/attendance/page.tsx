"use client"

import { useEffect, useState } from "react"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  _id?: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  punchIn?: string
  punchOut?: string
  totalHours?: number
  status: "Present" | "Absent" | "Late" | "Early Exit"
}

export default function EmployeeAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const init = async () => {
      // Get user data from localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        // Immediately fetch attendance for this user using parsed data to avoid
        // race where state hasn't updated before fetchAttendanceRecords runs.
        const employeeId = parsed?._id || parsed?.employeeId || parsed?.id
        await fetchAttendanceRecords(employeeId)
      } else {
        // No user in localStorage: fetch nothing
        await fetchAttendanceRecords(undefined)
      }
    }
    init()

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchAttendanceRecords = async (employeeIdParam?: string) => {
    try {
      const employeeId =
        employeeIdParam || user?._id || user?.employeeId || user?.id
      const url = employeeId
        ? `/api/attendance?employeeId=${encodeURIComponent(employeeId)}`
        : "/api/attendance"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const userRecords = data as AttendanceRecord[]
        setAttendanceRecords(userRecords)

        // Find today's record
        const todayRec = userRecords.find((record: AttendanceRecord) => record.date === today)
        setTodayRecord(todayRec || null)
        return userRecords
      }
      return null
    } catch (error) {
      console.error("Error fetching attendance:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const handlePunchIn = async () => {
    try {
      // Read from localStorage synchronously to avoid stale state
      const stored = localStorage.getItem("user")
      const parsed = stored ? JSON.parse(stored) : null
      const employeeId = parsed?._id || parsed?.employeeId || parsed?.id || ""
      const employeeName = parsed?.name || parsed?.employeeName || ""
      const department = parsed?.department || ""
      if (!employeeId) {
        toast({ title: "Not signed in", description: "Cannot punch in without a valid employee id" })
        return
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "punchIn",
          employeeId,
          employeeName,
          department,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTodayRecord(result.attendance)
        toast({
          title: "Punched In Successfully",
          description: `Welcome! You punched in at ${result.attendance.punchIn}`,
        })
        fetchAttendanceRecords()
      }
    } catch (error) {
      console.error("Error punching in:", error)
      toast({
        title: "Error",
        description: "Failed to punch in. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePunchOut = async () => {
    try {
      const stored = localStorage.getItem("user")
      const parsed = stored ? JSON.parse(stored) : null
      const employeeId = parsed?._id || parsed?.employeeId || parsed?.id || ""
      if (!employeeId) {
        toast({ title: "Not signed in", description: "Cannot punch out without a valid employee id" })
        return
      }
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "punchOut",
          employeeId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const updated = result.attendance as AttendanceRecord | null
        if (updated) {
          // Update today's record immediately and update local list to reflect new values
          setTodayRecord(updated)
          setAttendanceRecords((prev) => {
            // replace any record for the same date/_id with updated
            const filtered = prev.filter((r) => r._id !== updated._id && r.date !== updated.date)
            return [updated, ...filtered]
          })
          toast({
            title: "Punched Out Successfully",
            description: `Good bye! You worked for ${updated.totalHours} hours today.`,
          })
        } else {
          // If server returned null for some reason, re-fetch and try to find today's record
          const stored = localStorage.getItem("user")
          const parsed = stored ? JSON.parse(stored) : null
          const empId = parsed?._id || parsed?.employeeId || parsed?.id
          const fresh = await fetchAttendanceRecords(empId)
          const todayRec = fresh ? fresh.find((r) => r.date === today) : null
          if (todayRec) {
            setTodayRecord(todayRec)
            toast({
              title: "Punched Out Successfully",
              description: `Good bye! You worked for ${todayRec.totalHours} hours today.`,
            })
          } else {
            toast({ title: "Punch Out", description: "Punch out recorded. You may need to refresh to see updates." })
          }
        }
      }
    } catch (error) {
      console.error("Error punching out:", error)
      toast({
        title: "Error",
        description: "Failed to punch out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800"
      case "Late":
        return "bg-yellow-100 text-yellow-800"
      case "Early Exit":
        return "bg-orange-100 text-orange-800"
      case "Absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading attendance...</div>
        </div>
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">Track your daily attendance and working hours</p>
        </div>

        {/* Current Time and Punch Buttons */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-gray-900">{currentTime.toLocaleTimeString()}</div>
              <div className="text-lg text-gray-600">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex justify-center gap-4">
                {!todayRecord?.punchIn ? (
                  <Button
                    onClick={handlePunchIn}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Punch In
                  </Button>
                ) : !todayRecord?.punchOut ? (
                  <Button
                    onClick={handlePunchOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Punch Out
                  </Button>
                ) : (
                  <div className="text-green-600 font-medium">✓ You have completed your day</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Status */}
        {todayRecord && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Today's Status</CardTitle>
              <CardDescription>Your attendance for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Punch In</div>
                  <div className="text-xl font-bold text-blue-600">{todayRecord.punchIn || "--:--"}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Punch Out</div>
                  <div className="text-xl font-bold text-purple-600">{todayRecord.punchOut || "--:--"}</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Hours</div>
                  <div className="text-xl font-bold text-teal-600">
                    {todayRecord.totalHours ? `${todayRecord.totalHours}h` : "--"}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <Badge className={`${getStatusColor(todayRecord.status)} font-medium`}>{todayRecord.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance History */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance History
            </CardTitle>
            <CardDescription>Your past attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Punch In</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Punch Out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Hours</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.slice(0, 10).map((record, index) => (
                    <tr
                      key={record._id}
                      className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4 text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-700">{record.punchIn || "--:--"}</td>
                      <td className="py-3 px-4 text-gray-700">{record.punchOut || "--:--"}</td>
                      <td className="py-3 px-4 text-gray-700">{record.totalHours ? `${record.totalHours}h` : "--"}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(record.status)} font-medium`}>{record.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  )
}
