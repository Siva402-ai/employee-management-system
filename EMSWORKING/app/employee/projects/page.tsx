"use client"

import { useEffect, useState } from "react"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, Upload, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Project {
  _id?: string
  projectId: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  deadline: string
  status: "Pending" | "In-Progress" | "Completed"
  createdAt: string
  files?: string[]
}

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchMyProjects(parsedUser.employeeId)
    }
  }, [])

  const fetchMyProjects = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/projects?employeeId=${employeeId}`)
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

  const handleStatusUpdate = async (projectId: string, newStatus: "Pending" | "In-Progress" | "Completed") => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const { project: updated } = await response.json()
        setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))

        toast({
          title: "Status Updated",
          description: `Project status changed to ${newStatus}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update project status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating project status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (projectId: string, file: File) => {
    // In a real application, you would upload the file to a storage service
    // For now, we'll just simulate the upload
    toast({
      title: "File Upload",
      description: `File "${file.name}" uploaded successfully for project.`,
    })
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

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Pending":
        return 0
      case "In-Progress":
        return 50
      case "Completed":
        return 100
      default:
        return 0
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your projects...</div>
        </div>
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">Manage and track your assigned projects</p>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Assigned</h3>
              <p className="text-gray-600">You don't have any projects assigned to you yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => {
              const daysUntilDeadline = getDaysUntilDeadline(project.deadline)
              const isOverdue = daysUntilDeadline < 0
              const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0

              return (
                <Card key={project._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">{project.projectId}</CardDescription>
                      </div>
                      <Badge className={getStatusBadgeColor(project.status)}>{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700">{project.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Deadline:</span>
                        <span
                          className={`font-medium ${
                            isOverdue ? "text-red-600" : isUrgent ? "text-yellow-600" : "text-gray-900"
                          }`}
                        >
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      {(isOverdue || isUrgent) && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-red-400" />
                          <span className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-yellow-600"}`}>
                            {isOverdue
                              ? `${Math.abs(daysUntilDeadline)} days overdue`
                              : `${daysUntilDeadline} days left`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{getProgressPercentage(project.status)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(project.status)} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`status-${project._id}`} className="text-sm font-medium">
                          Current Status
                        </Label>
                        <Select
                          value={project.status}
                          onValueChange={(value: "Pending" | "In-Progress" | "Completed") =>
                            handleStatusUpdate(project._id!, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In-Progress">In-Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`file-${project._id}`} className="text-sm font-medium">
                          Upload Project Files
                        </Label>
                        <div className="mt-1">
                          <Input
                            id={`file-${project._id}`}
                            type="file"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files
                              if (files && files.length > 0) {
                                Array.from(files).forEach((file) => {
                                  handleFileUpload(project._id!, file)
                                })
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => {
                              const input = document.getElementById(`file-${project._id}`) as HTMLInputElement
                              input?.click()
                            }}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </EmployeeLayout>
  )
}
