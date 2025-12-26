"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Settings, Bell, Shield, User, Save } from "lucide-react"
import EmployeeLayout from "@/components/layout/employee-layout"

interface EmployeeSettings {
  // Profile Settings
  name: string
  email: string
  phone: string

  // Notification Settings
  emailNotifications: boolean
  leaveUpdates: boolean
  salaryAlerts: boolean
  systemUpdates: boolean

  // Security Settings
  twoFactorAuth: boolean
  sessionTimeout: number

  // Privacy Settings
  profileVisibility: boolean
  contactInfoVisible: boolean
}

export default function EmployeeSettings() {
  const [settings, setSettings] = useState<EmployeeSettings>({
    name: "",
    email: "",
    phone: "",
    emailNotifications: true,
    leaveUpdates: true,
    salaryAlerts: true,
    systemUpdates: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    profileVisibility: true,
    contactInfoVisible: true,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setSettings((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }))
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        const updatedUser = {
          ...user,
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof EmployeeSettings, value: string | boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <EmployeeLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive general email notifications</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="leaveUpdates">Leave Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about leave status changes</p>
                </div>
                <Switch
                  id="leaveUpdates"
                  checked={settings.leaveUpdates}
                  onCheckedChange={(checked) => handleInputChange("leaveUpdates", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="salaryAlerts">Salary Alerts</Label>
                  <p className="text-sm text-gray-500">Receive salary and payment notifications</p>
                </div>
                <Switch
                  id="salaryAlerts"
                  checked={settings.salaryAlerts}
                  onCheckedChange={(checked) => handleInputChange("salaryAlerts", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemUpdates">System Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about system maintenance</p>
                </div>
                <Switch
                  id="systemUpdates"
                  checked={settings.systemUpdates}
                  onCheckedChange={(checked) => handleInputChange("systemUpdates", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange("twoFactorAuth", checked)}
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange("sessionTimeout", Number.parseInt(e.target.value) || 30)}
                  min="5"
                  max="120"
                />
                <p className="text-sm text-gray-500 mt-1">Automatically log out after inactivity</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Make your profile visible to colleagues</p>
                </div>
                <Switch
                  id="profileVisibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) => handleInputChange("profileVisibility", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contactInfoVisible">Contact Info Visibility</Label>
                  <p className="text-sm text-gray-500">Show contact information to others</p>
                </div>
                <Switch
                  id="contactInfoVisible"
                  checked={settings.contactInfoVisible}
                  onCheckedChange={(checked) => handleInputChange("contactInfoVisible", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeLayout>
  )
}
