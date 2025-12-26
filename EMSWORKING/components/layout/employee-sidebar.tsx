"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, Calendar, DollarSign, Settings, LogOut, FolderOpen, Clock } from "lucide-react"

const employeeMenuItems = [
  {
    title: "Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/employee/profile",
    icon: User,
  },
  {
    title: "My Projects",
    href: "/employee/projects",
    icon: FolderOpen,
  },
  {
    title: "My Attendance",
    href: "/employee/attendance",
    icon: Clock,
  },
  {
    title: "My Leaves",
    href: "/employee/leaves",
    icon: Calendar,
  },
  {
    title: "My Salary",
    href: "/employee/salary",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/employee/settings",
    icon: Settings,
  },
]

export function EmployeeSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Employee Portal</h2>
      </div>
      <nav className="mt-8">
        {employeeMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors hover:bg-teal-600",
                isActive ? "bg-teal-600 text-white" : "text-gray-300 hover:text-white",
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-red-600 transition-colors w-full text-left"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </nav>
    </div>
  )
}
