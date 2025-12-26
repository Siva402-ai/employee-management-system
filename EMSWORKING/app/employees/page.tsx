// Basic Employee type definition
export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary?: number | string;
  image?: string;
  dateOfBirth: string;
  // Add more fields as needed
}
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Eye, Edit, DollarSign, Calendar, Plus, Search, Trash } from "lucide-react"
// ...removed invalid Employee import...
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function EmployeesPage() {
  // For photo preview in Add Employee dialog
  const [newEmployeePreview, setNewEmployeePreview] = useState<string | null>(null);
  // Add Employee dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeId: "",
    name: "",
    email: "",
    dateOfBirth: "",
    department: "",
    position: "",
    salary: "",
    image: ""
  });

  async function handleAddEmployeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      if (res.ok) {
        toast({ title: "Employee added" });
        setIsAddDialogOpen(false);
        setNewEmployee({
          employeeId: "",
          name: "",
          email: "",
          dateOfBirth: "",
          department: "",
          position: "",
          salary: "",
          image: ""
        });
        setNewEmployeePreview(null);
        fetchEmployees();
      } else {
        toast({ title: "Add failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error adding employee", description: String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  // State hooks
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const employeesPerPage = 10;
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      toast({ title: "Error fetching employees", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setFilteredEmployees(
      employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const indexOfFirstEmployee = (currentPage - 1) * employeesPerPage;
  const indexOfLastEmployee = indexOfFirstEmployee + employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  function handleAction(action: string, id: string) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    if (action === "view") {
      setViewEmployee(emp);
      return;
    }
    if (action === "edit") {
      setEditEmployee(emp);
      return;
    }
    if (action === "salary") {
      router.push(`/salary?employeeId=${encodeURIComponent(emp.employeeId)}`);
      return;
    }
    if (action === "leave") {
      router.push(`/leaves?employeeId=${encodeURIComponent(emp.employeeId)}`);
      return;
    }
  }

  async function handleEditEmployeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editEmployee) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${editEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEmployee),
      });
      if (res.ok) {
        toast({ title: "Employee updated" });
        setEditEmployee(null);
        fetchEmployees();
      } else {
        toast({ title: "Update failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error updating employee", description: String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Employee deleted" });
        fetchEmployees();
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error deleting employee", description: String(err), variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading employees...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div>
      <DashboardLayout>
        {/* Add Employee Button and Dialog */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
              <div>
                <Label>Employee ID</Label>
                <Input
                  value={newEmployee.employeeId}
                  onChange={e => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={newEmployee.dateOfBirth}
                  onChange={e => setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={newEmployee.department}
                  onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={newEmployee.position}
                  onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Salary</Label>
                <Input
                  type="number"
                  value={newEmployee.salary}
                  onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewEmployee({ ...newEmployee, image: reader.result as string });
                        setNewEmployeePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newEmployeePreview && (
                  <div className="mt-2">
                    <img src={newEmployeePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border" />
                  </div>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Employee"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {/* View Employee Dialog */}
        <Dialog open={!!viewEmployee} onOpenChange={() => setViewEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {viewEmployee && (
              <div className="space-y-2">
                <div><strong>Name:</strong> {viewEmployee.name}</div>
                <div><strong>Email:</strong> {viewEmployee.email}</div>
                <div><strong>Department:</strong> {viewEmployee.department}</div>
                <div><strong>Position:</strong> {viewEmployee.position}</div>
                <div><strong>Date of Birth:</strong> {viewEmployee.dateOfBirth}</div>
                <div><strong>Salary:</strong> {viewEmployee.salary}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={!!editEmployee} onOpenChange={() => setEditEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            {editEmployee && (
              <form onSubmit={handleEditEmployeeSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editEmployee.name}
                    onChange={e => setEditEmployee({ ...editEmployee, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editEmployee.email}
                    onChange={e => setEditEmployee({ ...editEmployee, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={editEmployee.department}
                    onChange={e => setEditEmployee({ ...editEmployee, department: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={editEmployee.position}
                    onChange={e => setEditEmployee({ ...editEmployee, position: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={editEmployee.dateOfBirth}
                    onChange={e => setEditEmployee({ ...editEmployee, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Salary</Label>
                  <Input
                    type="number"
                    value={editEmployee.salary as string}
                    onChange={e => setEditEmployee({ ...editEmployee, salary: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Employee"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Photo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">DOB</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((employee, index) => (
                    <tr
                      key={employee.id || index}
                      className={`border-b ${(indexOfFirstEmployee + index) % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4">{indexOfFirstEmployee + index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={employee.image || "/professional-headshot.png"}
                            alt={employee.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{new Date(employee.dateOfBirth).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">{employee.department}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => {
                              const id = typeof employee.id === 'string' && employee.id.length > 0
                                ? employee.id
                                : undefined;
                              if (id) handleAction("view", id);
                            }}
                            disabled={!(typeof employee.id === 'string' && employee.id.length > 0)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => {
                              const id = typeof employee.id === 'string' && employee.id.length > 0
                                ? employee.id
                                : undefined;
                              if (id) handleAction("edit", id);
                            }}
                            disabled={!(typeof employee.id === 'string' && employee.id.length > 0)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => {
                              const id = typeof employee.id === 'string' && employee.id.length > 0
                                ? employee.id
                                : undefined;
                              if (id) handleAction("salary", id);
                            }}
                            disabled={!(typeof employee.id === 'string' && employee.id.length > 0)}
                          >
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => {
                              const id = typeof employee.id === 'string' && employee.id.length > 0
                                ? employee.id
                                : undefined;
                              if (id) handleAction("leave", id);
                            }}
                            disabled={!(typeof employee.id === 'string' && employee.id.length > 0)}
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
                          {/* 🔴 Delete button */}
                          <Button
                            size="sm"
                            className="bg-red-700 hover:bg-red-800 text-white"
                            onClick={() => {
                              const id = typeof employee.id === 'string' && employee.id.length > 0
                                ? employee.id
                                : undefined;
                              if (id) handleDeleteEmployee(id);
                            }}
                            disabled={!(typeof employee.id === 'string' && employee.id.length > 0)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </div>
  );
}
