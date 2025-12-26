"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Building2, Calendar, DollarSign, Settings, FolderOpen, Clock } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Building2,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
  },
  {
    title: "Leaves",
    href: "/leaves",
    icon: Calendar,
  },
  {
    title: "Salary",
    href: "/salary",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Employee MS</h2>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => {
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
      </nav>
    </div>
  )
}
