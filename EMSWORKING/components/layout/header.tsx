"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="bg-teal-600 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Employee MS</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome Admin</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-teal-600 border-white hover:bg-white hover:text-teal-700 bg-transparent"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
