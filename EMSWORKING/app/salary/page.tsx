"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<any[]>([])
  const [editSalary, setEditSalary] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newSalary, setNewSalary] = useState({
    employeeId: "",
    employeeName: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    month: "",
    year: "",
  })

  const searchParams = useSearchParams()
  const employeeFilter = searchParams.get("employeeId") || ""

  const salariesToShow = employeeFilter
    ? salaries.filter((s) => s.employeeId.toLowerCase() === employeeFilter.toLowerCase())
    : salaries

  const { toast } = useToast()

  useEffect(() => {
    fetchSalaries()
  }, [])

  const fetchSalaries = async () => {
    try {
      const response = await fetch("/api/salary")
      if (response.ok) {
        const data = await response.json()
        setSalaries(data)
      }
    } catch (error) {
      console.error("Error fetching salaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (action: string, salaryId: string) => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this salary record?")) return;
      fetch(`/api/salary/${salaryId}`, { method: "DELETE" })
        .then((res) => {
          if (res.ok) {
            setSalaries((prev) => prev.filter((s) => s.id !== salaryId));
            toast({ title: "Salary Deleted", description: "Salary record deleted successfully." });
          } else {
            toast({ title: "Delete failed", variant: "destructive" });
          }
        })
        .catch((err) => {
          toast({ title: "Error deleting salary", description: String(err), variant: "destructive" });
        });
    }
    if (action === "edit") {
      const salary = salaries.find((s) => s.id === salaryId);
      if (salary) setEditSalary(salary);
    }
  }

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const basicSalary = Number.parseFloat(newSalary.basicSalary)
      const allowances = Number.parseFloat(newSalary.allowances)
      const deductions = Number.parseFloat(newSalary.deductions)
      const netSalary = basicSalary + allowances - deductions

      const response = await fetch("/api/salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSalary,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          year: Number.parseInt(newSalary.year),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSalaries([...salaries, result.salary])
        setNewSalary({
          employeeId: "",
          employeeName: "",
          basicSalary: "",
          allowances: "",
          deductions: "",
          month: "",
          year: "",
        })
        setIsAddDialogOpen(false)

        toast({
          title: "Salary Record Added",
          description: "New salary record has been created successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add salary record. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding salary:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading salary data...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Edit Salary Dialog */}
        <Dialog open={!!editSalary} onOpenChange={(open) => !open && setEditSalary(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Salary Record</DialogTitle>
            </DialogHeader>
            {editSalary && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    const basicSalary = Number.parseFloat(editSalary.basicSalary);
                    const allowances = Number.parseFloat(editSalary.allowances);
                    const deductions = Number.parseFloat(editSalary.deductions);
                    const netSalary = basicSalary + allowances - deductions;
                    const response = await fetch(`/api/salary/${editSalary.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ...editSalary,
                        basicSalary,
                        allowances,
                        deductions,
                        netSalary,
                        year: Number.parseInt(editSalary.year),
                      }),
                    });
                    if (response.ok) {
                      const result = await response.json();
                      setSalaries((prev) => prev.map((s) => (s.id === editSalary.id ? result.salary : s)));
                      setEditSalary(null);
                      toast({ title: "Salary Updated", description: "Salary record updated successfully." });
                    } else {
                      toast({ title: "Update failed", variant: "destructive" });
                    }
                  } catch (err) {
                    toast({ title: "Error updating salary", description: String(err), variant: "destructive" });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="editEmployeeId">Employee ID</Label>
                  <Input
                    id="editEmployeeId"
                    value={editSalary.employeeId}
                    onChange={(e) => setEditSalary({ ...editSalary, employeeId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEmployeeName">Employee Name</Label>
                  <Input
                    id="editEmployeeName"
                    value={editSalary.employeeName}
                    onChange={(e) => setEditSalary({ ...editSalary, employeeName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editBasicSalary">Basic Salary</Label>
                  <Input
                    id="editBasicSalary"
                    type="number"
                    value={editSalary.basicSalary}
                    onChange={(e) => setEditSalary({ ...editSalary, basicSalary: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editAllowances">Allowances</Label>
                  <Input
                    id="editAllowances"
                    type="number"
                    value={editSalary.allowances}
                    onChange={(e) => setEditSalary({ ...editSalary, allowances: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDeductions">Deductions</Label>
                  <Input
                    id="editDeductions"
                    type="number"
                    value={editSalary.deductions}
                    onChange={(e) => setEditSalary({ ...editSalary, deductions: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editMonth">Month</Label>
                  <Select
                    value={editSalary.month}
                    onValueChange={(value) => setEditSalary({ ...editSalary, month: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editYear">Year</Label>
                  <Input
                    id="editYear"
                    type="number"
                    value={editSalary.year}
                    onChange={(e) => setEditSalary({ ...editSalary, year: e.target.value })}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditSalary(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Salary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Salary Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSalary} className="space-y-4">
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={newSalary.employeeId}
                    onChange={(e) => setNewSalary({ ...newSalary, employeeId: e.target.value })}
                    placeholder="EMP001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    value={newSalary.employeeName}
                    onChange={(e) => setNewSalary({ ...newSalary, employeeName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basicSalary">Basic Salary</Label>
                  <Input
                    id="basicSalary"
                    type="number"
                    value={newSalary.basicSalary}
                    onChange={(e) => setNewSalary({ ...newSalary, basicSalary: e.target.value })}
                    placeholder="60000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="allowances">Allowances</Label>
                  <Input
                    id="allowances"
                    type="number"
                    value={newSalary.allowances}
                    onChange={(e) => setNewSalary({ ...newSalary, allowances: e.target.value })}
                    placeholder="10000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={newSalary.deductions}
                    onChange={(e) => setNewSalary({ ...newSalary, deductions: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={newSalary.month}
                    onValueChange={(value) => setNewSalary({ ...newSalary, month: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newSalary.year}
                    onChange={(e) => setNewSalary({ ...newSalary, year: e.target.value })}
                    placeholder="2024"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Salary"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Salary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(salariesToShow.reduce((sum, salary) => sum + salary.netSalary, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Salary</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {formatCurrency(
                      salariesToShow.length > 0
                        ? salariesToShow.reduce((sum, salary) => sum + salary.netSalary, 0) / salariesToShow.length
                        : 0,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Employees</p>
                  <p className="text-2xl font-bold text-purple-500">{salariesToShow.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Salary Records{employeeFilter ? ` • ${employeeFilter}` : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">S No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Basic Salary</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Allowances</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Deductions</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Salary</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salariesToShow.map((salary, index) => (
                    <tr
                      key={salary.id}
                      className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{salary.employeeName}</div>
                          <div className="text-sm text-gray-500">{salary.employeeId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{formatCurrency(salary.basicSalary)}</td>
                      <td className="py-3 px-4 text-green-600">{formatCurrency(salary.allowances)}</td>
                      <td className="py-3 px-4 text-red-600">{formatCurrency(salary.deductions)}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {formatCurrency(salary.netSalary)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {salary.month} {salary.year}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => handleAction("edit", salary.id!)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleAction("delete", salary.id!)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
