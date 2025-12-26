"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit } from "lucide-react"
import EmployeeLayout from "@/components/layout/employee-layout"

interface Employee {
  id: string
  employeeId?: string
  _id?: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  department: string
  position: string
  joinDate: string
  salary: number
}

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Employee>>({})

  useEffect(() => {
    // Try to load the logged-in user from localStorage and fetch fresh employee data
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Accept different stored user shapes: prefer _id, then employeeId, then id
        const id = parsed?._id || parsed?.employeeId || parsed?.id
        if (id) {
          fetch(`/api/employees/${id}`)
            .then((res) => res.json())
            .then((data) => {
              // API returns the employee object (or { error })
              if (data && !data.error) {
                setEmployee(data)
                setFormData(data)
              }
            })
            .catch((err) => console.error("Fetch employee error:", err))
        }
      } catch (e) {
        console.error("Error parsing stored user:", e)
      }
    }
  }, [])

  const handleSave = () => {
    if (employee && formData) {
      setEmployee({ ...employee, ...formData })
      setIsEditing(false)
      // In real app, send PUT request to API
    }
  }

  if (!employee) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <EmployeeLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">View and manage your personal information</p>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your personal information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{employee.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{employee.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-teal-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{employee.employeeId || employee.id || employee._id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">{new Date(employee.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Current Salary</p>
                  <p className="font-medium">${employee.salary.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeLayout>
  )
}
