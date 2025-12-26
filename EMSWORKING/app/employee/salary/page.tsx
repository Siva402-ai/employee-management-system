"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Calendar, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import EmployeeLayout from "@/components/layout/employee-layout"

interface SalaryRecord {
  id: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  // original breakdowns as stored in DB (optional)
  allowancesBreakdown?: any
  deductionsBreakdown?: any
  netSalary: number
  status: "paid" | "pending"
  payDate: string
}

export default function EmployeeSalary() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [currentSalary, setCurrentSalary] = useState({
    basic: 0,
    allowances: 0,
    deductions: 0,
    net: 0,
  })
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    // Load logged-in user from localStorage and fetch authoritative data
    const load = async () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
        if (!stored) {
          toast({ title: "Not signed in", description: "No user found in localStorage" })
          return
        }

        const user = JSON.parse(stored)
        const employeeId = user._id || user.employeeId || user.id
        if (!employeeId) {
          toast({ title: "No employee id", description: "Logged in user does not contain an employee id" })
          return
        }

        // Fetch employee to get canonical salary if salary records are missing
        const empRes = await fetch(`/api/employees/${encodeURIComponent(employeeId)}`)
        // Prefer the canonical business employeeId from the employee document (e.g. EMP001)
        let businessId: string | undefined = undefined
        if (empRes.ok) {
          const emp = await empRes.json()
          const annualSalary = typeof emp.salary === "number" ? emp.salary : Number(emp.salary || 0)
          businessId = emp.employeeId || emp.id || emp._id || undefined
          // set a fallback current salary (use stored salary if present)
          setCurrentSalary((prev) => ({
            ...prev,
            basic: annualSalary || prev.basic,
            allowances: prev.allowances || 0,
            deductions: prev.deductions || 0,
            net: prev.net || annualSalary || prev.net,
          }))
        }

        // Fetch salary records (server-side filtered by business employeeId when available)
        const queryId = businessId || employeeId
        const salRes = await fetch(`/api/salary?employeeId=${encodeURIComponent(queryId)}`)
        if (salRes.ok) {
          const data = await salRes.json()
          const mySalaries = (data as any[]).map((s: any) => {
            // allowances and deductions may be stored as numbers or as breakdown arrays/objects
            const computeSum = (val: any) => {
              if (val == null) return 0
              if (typeof val === "number") return val
              if (Array.isArray(val)) {
                // array of { label, amount } or numbers
                return val.reduce((sum: number, item: any) => {
                  if (typeof item === "number") return sum + item
                  if (item && typeof item.amount === "number") return sum + item.amount
                  if (item && typeof item.value === "number") return sum + item.value
                  return sum
                }, 0)
              }
              if (typeof val === "object") {
                // object with keyed amounts
                return Object.values(val).reduce((sum: number, v: any) => {
                  if (typeof v === "number") return sum + v
                  if (v && typeof v.amount === "number") return sum + v.amount
                  return sum
                }, 0)
              }
              return Number(val) || 0
            }

            const allowancesSum = computeSum(s.allowances)
            const deductionsSum = computeSum(s.deductions)

            return {
              id: s.id || s._id || String(s._id || s.id),
              month: s.month,
              year: s.year,
              basicSalary: Number(s.basicSalary || s.basic || 0),
              allowances: allowancesSum,
              deductions: deductionsSum,
              allowancesBreakdown: s.allowances,
              deductionsBreakdown: s.deductions,
              netSalary:
                typeof s.netSalary === "number"
                  ? s.netSalary
                  : typeof s.net === "number"
                  ? s.net
                  : Number(s.netSalary || s.net || (Number(s.basicSalary || s.basic || 0) + allowancesSum - deductionsSum)),
              status: s.status || "paid",
              payDate: s.payDate || s.createdAt || null,
            }
          })

          // sort by payDate (newest first) when possible
          mySalaries.sort((a: any, b: any) => {
            const da = a.payDate ? new Date(a.payDate).getTime() : 0
            const db = b.payDate ? new Date(b.payDate).getTime() : 0
            return db - da
          })

          setSalaryRecords(mySalaries)

          // if we have at least one salary record, use it as current
          if (mySalaries.length > 0) {
            const latest = mySalaries[0]
            setCurrentSalary({
              basic: latest.basicSalary,
              allowances: latest.allowances,
              deductions: latest.deductions,
              net: latest.netSalary,
            })
          }
        }
      } catch (err) {
        console.error("Error loading salary data:", err)
        toast({ title: "Error", description: "Failed to load salary information" })
      }
    }

    load()
  }, [])

  const getStatusColor = (status: string) => {
    return status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const yearToDateEarnings = salaryRecords
    .filter((record) => record.year === 2024 && record.status === "paid")
    .reduce((total, record) => total + record.netSalary, 0)

  const handleViewSalary = (record: SalaryRecord) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
  }

  const handleDownloadSalary = (record: SalaryRecord) => {
    // Simulate PDF download
    toast({
      title: "Download Started",
      description: `Downloading salary slip for ${record.month} ${record.year}`,
    })

    // Create a simple text content for download
    const content = `
SALARY SLIP
-----------
Employee: John Doe
Month: ${record.month} ${record.year}
Pay Date: ${new Date(record.payDate).toLocaleDateString()}

EARNINGS:
Basic Salary: $${record.basicSalary.toLocaleString()}
Allowances: $${record.allowances.toLocaleString()}
Gross Salary: $${(record.basicSalary + record.allowances).toLocaleString()}

DEDUCTIONS:
Total Deductions: $${record.deductions.toLocaleString()}

NET SALARY: $${record.netSalary.toLocaleString()}
Status: ${record.status.toUpperCase()}
    `

    // Create and download file
    const blob = new Blob([content], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `salary-slip-${record.month}-${record.year}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <EmployeeLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Salary</h1>
            <p className="text-gray-600">View your salary details and payment history</p>
          </div>
        </div>

        {/* Current Salary Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Basic Salary</p>
                  <p className="text-2xl font-bold">${currentSalary.basic.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Allowances</p>
                  <p className="text-2xl font-bold text-green-600">${currentSalary.allowances.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Deductions</p>
                  <p className="text-2xl font-bold text-red-600">${currentSalary.deductions.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Salary</p>
                  <p className="text-2xl font-bold text-teal-600">${currentSalary.net.toLocaleString()}</p>
                </div>
                <Calendar className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year to Date Summary */}
        <Card>
          <CardHeader>
            <CardTitle>2024 Year-to-Date Summary</CardTitle>
            <CardDescription>Your earnings summary for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-teal-600">${yearToDateEarnings.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Months Paid</p>
                <p className="text-3xl font-bold text-blue-600">
                  {salaryRecords.filter((r) => r.status === "paid" && r.year === 2024).length}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Monthly</p>
                <p className="text-3xl font-bold text-green-600">
                  $
                  {Math.round(
                    yearToDateEarnings / salaryRecords.filter((r) => r.status === "paid" && r.year === 2024).length,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary History */}
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
            <CardDescription>Your monthly salary records and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salaryRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {record.month} {record.year}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Basic: ${record.basicSalary.toLocaleString()} | Allowances: $
                        {record.allowances.toLocaleString()} | Deductions: ${record.deductions.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Pay Date: {new Date(record.payDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">${record.netSalary.toLocaleString()}</p>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewSalary(record)} title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSalary(record)}
                        title="Download Salary Slip"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Salary Details</DialogTitle>
              <DialogDescription>
                {selectedRecord && `${selectedRecord.month} ${selectedRecord.year} Salary Breakdown`}
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Salary:</span>
                      <span>${selectedRecord.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowances:</span>
                      <span>${selectedRecord.allowances.toLocaleString()}</span>
                    </div>
                    {/* show breakdown if available */}
                    {selectedRecord.allowancesBreakdown && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="font-medium">Allowances breakdown:</div>
                        <ul className="list-disc pl-5">
                          {Array.isArray(selectedRecord.allowancesBreakdown)
                            ? selectedRecord.allowancesBreakdown.map((a: any, i: number) => (
                                <li key={i}>
                                  {typeof a === "number" ? `$${a}` : a.label ? `${a.label}: $${a.amount}` : JSON.stringify(a)}
                                </li>
                              ))
                            : typeof selectedRecord.allowancesBreakdown === "object"
                            ? Object.entries(selectedRecord.allowancesBreakdown).map(([k, v]: any, i: number) => (
                                <li key={i}>{`${k}: $${typeof v === "number" ? v : (v && v.amount) || v}`}</li>
                              ))
                            : null}
                        </ul>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Gross Salary:</span>
                      <span>${(selectedRecord.basicSalary + selectedRecord.allowances).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span>${selectedRecord.deductions.toLocaleString()}</span>
                    </div>
                    {selectedRecord.deductionsBreakdown && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="font-medium">Deductions breakdown:</div>
                        <ul className="list-disc pl-5">
                          {Array.isArray(selectedRecord.deductionsBreakdown)
                            ? selectedRecord.deductionsBreakdown.map((d: any, i: number) => (
                                <li key={i}>{typeof d === "number" ? `$${d}` : d.label ? `${d.label}: $${d.amount}` : JSON.stringify(d)}</li>
                              ))
                            : typeof selectedRecord.deductionsBreakdown === "object"
                            ? Object.entries(selectedRecord.deductionsBreakdown).map(([k, v]: any, i: number) => (
                                <li key={i}>{`${k}: $${typeof v === "number" ? v : (v && v.amount) || v}`}</li>
                              ))
                            : null}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-teal-700">Net Salary:</span>
                    <span className="text-xl font-bold text-teal-700">
                      ${selectedRecord.netSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Pay Date:</span>
                    <span className="text-sm">{new Date(selectedRecord.payDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  )
}
