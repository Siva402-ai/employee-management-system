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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Plus, Search, FolderOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id?: string
  projectId: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  deadline: string
  status: "Pending" | "In-Progress" | "Completed"
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const projectsPerPage = 10

  const [newProject, setNewProject] = useState({
  projectId: "",
  title: "",
  description: "",
  assignedTo: "",
  deadline: "",
  status: "Pending" as "Pending" | "In-Progress" | "Completed",
  })

  const [editProject, setEditProject] = useState<Project | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const filterProjects = () => {
    if (!searchTerm) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(
        (project) =>
          project.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProjects(filtered)
    }
    setCurrentPage(1)
  }

  const indexOfLastProject = currentPage * projectsPerPage
  const indexOfFirstProject = indexOfLastProject - projectsPerPage
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject)
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const assignedEmployee = employees.find((emp) => emp.employeeId === newProject.assignedTo)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProject,
          assignedToName: assignedEmployee?.name || "",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProjects([...projects, result.project])
        setNewProject({
          projectId: "",
          title: "",
          description: "",
          assignedTo: "",
          deadline: "",
          status: "Pending",
        })
        setIsAddDialogOpen(false)

        toast({
          title: "Project Added Successfully",
          description: "New project has been created and assigned.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add project. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding project:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProject) return
    setIsSubmitting(true)

    const assignedEmployee = employees.find((emp) => emp.employeeId === editProject.assignedTo)

    try {
      const response = await fetch(`/api/projects/${editProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editProject,
          assignedToName: assignedEmployee?.name || "",
        }),
      })

      if (response.ok) {
        const { project: updated } = await response.json()
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditProject(null)

        toast({
          title: "Project Updated",
          description: "Project information has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update project. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating project:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId))
        toast({
          title: "Project Deleted",
          description: "Project has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete project. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "In-Progress":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading projects...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input
                    id="projectId"
                    value={newProject.projectId}
                    onChange={(e) => setNewProject({ ...newProject, projectId: e.target.value })}
                    placeholder="PRJ001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Website Redesign"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Project description..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select
                    value={typeof newProject.assignedTo === 'string' ? newProject.assignedTo : ''}
                    onValueChange={(value) => {
                      setNewProject({ ...newProject, assignedTo: value })
                      console.log('Selected employee for new project:', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.name} ({employee.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProject.status}
                    onValueChange={(value: "Pending" | "In-Progress" | "Completed") =>
                      setNewProject({ ...newProject, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In-Progress">In-Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Project ID, Title, or Assigned Employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="mr-2 h-5 w-5" />
              Projects List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Project ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Project Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned To</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Deadline</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project, index) => (
                    <tr
                      key={project.id || (project as any)._id}
                      className={`border-b ${
                        (indexOfFirstProject + index) % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{project.projectId}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{project.assignedToName}</td>
                      <td className="py-3 px-4 text-gray-700">{new Date(project.deadline).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadgeColor(project.status)}>{project.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => setEditProject(project)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDeleteProject(project.id!)}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, filteredProjects.length)} of{" "}
                  {filteredProjects.length} projects
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-teal-600 hover:bg-teal-700" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            {editProject && (
              <form onSubmit={handleEditProject} className="space-y-4">
                <div>
                  <Label htmlFor="editProjectId">Project ID</Label>
                  <Input
                    id="editProjectId"
                    value={editProject.projectId}
                    onChange={(e) => setEditProject({ ...editProject, projectId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editTitle">Project Title</Label>
                  <Input
                    id="editTitle"
                    value={editProject.title}
                    onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editAssignedTo">Assign To</Label>
                  <Select
                    value={editProject && typeof editProject.assignedTo === 'string' ? editProject.assignedTo : ''}
                    onValueChange={(value) => {
                      setEditProject(editProject ? { ...editProject, assignedTo: value } : null)
                      console.log('Selected employee for edit project:', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.name} ({employee.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDeadline">Deadline</Label>
                  <Input
                    id="editDeadline"
                    type="date"
                    value={editProject.deadline}
                    onChange={(e) => setEditProject({ ...editProject, deadline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editProject.status}
                    onValueChange={(value: "Pending" | "In-Progress" | "Completed") =>
                      setEditProject({ ...editProject, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In-Progress">In-Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditProject(null)}>
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
      </div>
    </DashboardLayout>
  )
}
