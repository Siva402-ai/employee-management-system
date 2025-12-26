"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Plus, Search } from "lucide-react"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editDepartment, setEditDepartment] = useState<{
    id: string
    name: string
    description: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    filterDepartments()
  }, [departments, searchTerm])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterDepartments = () => {
    if (!searchTerm) {
      setFilteredDepartments(departments)
    } else {
      const filtered = departments.filter((department) =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredDepartments(filtered)
    }
  }

  const handleAction = (action: string, departmentId: string) => {
    if (action === "edit") {
      const dept = departments.find((d) => d.id === departmentId)
      if (!dept) return
      setEditDepartment({
        id: dept.id!,
        name: dept.name,
        description: dept.description || "",
      })
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDepartment),
      })

      if (response.ok) {
        const result = await response.json()
        setDepartments([...departments, result.department])
        setNewDepartment({
          name: "",
          description: "",
        })
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding department:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await fetch(`/api/departments/${departmentId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setDepartments(departments.filter((dept) => dept.id !== departmentId))
        }
      } catch (error) {
        console.error("Error deleting department:", error)
      }
    }
  }

  const handleEditDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editDepartment) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/departments/${editDepartment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editDepartment.name, description: editDepartment.description }),
      })
      if (res.ok) {
        const { department } = await res.json()
        setDepartments((prev) => prev.map((d) => (d.id === department.id ? department : d)))
        setEditDepartment(null)
      }
    } catch (e) {
      console.error("Error updating department:", e)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading departments...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="Engineering"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    placeholder="Department description..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Department"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Department Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Department List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">S No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((department, index) => (
                    <tr
                      key={department.id}
                      className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{department.name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{department.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => handleAction("edit", department.id!)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDeleteDepartment(department.id!)}
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

        <Dialog open={!!editDepartment} onOpenChange={(open) => !open && setEditDepartment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            {editDepartment && (
              <form onSubmit={handleEditDepartmentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="deptName">Department Name</Label>
                  <Input
                    id="deptName"
                    value={editDepartment.name}
                    onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deptDesc">Description</Label>
                  <Textarea
                    id="deptDesc"
                    value={editDepartment.description}
                    onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditDepartment(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
