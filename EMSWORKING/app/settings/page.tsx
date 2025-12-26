"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Settings, User, Bell, Shield, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [adminProfile, setAdminProfile] = useState({
    name: "System Administrator",
    email: "admin@company.com",
    phone: "+1 (555) 123-4567",
  })

  const [systemSettings, setSystemSettings] = useState({
    companyName: "Your Company Ltd.",
    companyAddress: "123 Business Street, City, State 12345",
    workingHours: "9:00 AM - 5:00 PM",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    leaveNotifications: true,
    salaryNotifications: true,
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSystemSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings Saved",
        description: "System settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Preferences Updated",
        description: "Notification preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (security.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDatabaseAction = async (action: string) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: `${action} Completed`,
        description: `${action} operation completed successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Profile Settings */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Admin Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Full Name</Label>
                  <Input
                    id="admin-name"
                    value={adminProfile.name}
                    onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Phone</Label>
                  <Input
                    id="admin-phone"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                  />
                </div>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSettingsUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address">Company Address</Label>
                  <Textarea
                    id="company-address"
                    value={systemSettings.companyAddress}
                    onChange={(e) => setSystemSettings({ ...systemSettings, companyAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working-hours">Working Hours</Label>
                  <Input
                    id="working-hours"
                    value={systemSettings.workingHours}
                    onChange={(e) => setSystemSettings({ ...systemSettings, workingHours: e.target.value })}
                  />
                </div>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="leave-notifications">Leave Request Alerts</Label>
                <Switch
                  id="leave-notifications"
                  checked={notifications.leaveNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, leaveNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="salary-notifications">Salary Processing Alerts</Label>
                <Switch
                  id="salary-notifications"
                  checked={notifications.salaryNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, salaryNotifications: checked })}
                />
              </div>
              <Button
                onClick={handleNotificationUpdate}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Preferences"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  />
                </div>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Database Management */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent"
                onClick={() => handleDatabaseAction("Backup Database")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Backup Database"}
              </Button>
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50 bg-transparent"
                onClick={() => handleDatabaseAction("Export Data")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Export Data"}
              </Button>
              <Button
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 bg-transparent"
                onClick={() => handleDatabaseAction("System Logs")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "System Logs"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
