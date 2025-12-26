"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, AlertTriangle, Gift, Award, Clock, CheckCircle, X } from "lucide-react"
import type { Notification } from "@/lib/mock-data"

export function NotificationAlerts() {
  const [criticalNotifications, setCriticalNotifications] = useState<Notification[]>([])
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCriticalNotifications()
  }, [])

  const fetchCriticalNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        // Show only high priority unread notifications
        const critical = data.filter(
          (n: Notification) => n.priority === "high" && !n.read && !dismissedNotifications.has(n._id!),
        )
        setCriticalNotifications(critical)
      }
    } catch (error) {
      console.error("Error fetching critical notifications:", error)
    }
  }

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications((prev) => new Set([...prev, notificationId]))
    setCriticalNotifications((prev) => prev.filter((n) => n._id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "attendance_anomaly":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "birthday":
        return <Gift className="h-5 w-5 text-green-500" />
      case "work_anniversary":
        return <Award className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "leave_request":
        return "border-blue-200 bg-blue-50"
      case "attendance_anomaly":
        return "border-red-200 bg-red-50"
      case "birthday":
        return "border-green-200 bg-green-50"
      case "work_anniversary":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  if (criticalNotifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mb-6">
      {criticalNotifications.map((notification) => (
        <Card key={notification._id} className={`shadow-md border-l-4 ${getAlertStyle(notification.type)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <Badge variant="destructive" className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {notification.employeeName && <span>Employee: {notification.employeeName}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Action
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissNotification(notification._id!)}
                  className="text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
