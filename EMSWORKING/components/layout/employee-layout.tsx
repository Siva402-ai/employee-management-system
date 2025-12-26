import type React from "react"
import { EmployeeSidebar } from "./employee-sidebar"
import { Header } from "./header"

interface EmployeeLayoutProps {
  children: React.ReactNode
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  )
}

export default EmployeeLayout
