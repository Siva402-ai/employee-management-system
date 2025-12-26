"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/dashboard")
        } else {
          router.push("/employee/dashboard")
        }
      } else {
        setError(data.message || "Login failed")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-white" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      {/* Top: teal cover exactly top 50vh */}
      <div className="w-full h-[50vh] flex items-center justify-center pb-20" style={{ backgroundColor: "#118A7E" }}>
        <h1
          className="text-white text-3xl md:text-4xl lg:text-5xl text-center"
          style={{ fontFamily: 'var(--font-cookie), cursive', transform: 'translateY(-40%)' }}
        >
          Employee Management System
        </h1>
      </div>

      {/* Center the card exactly in the middle of the viewport */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full flex justify-center z-10">
        <Card className="w-full max-w-sm bg-white rounded shadow-lg border">
          <CardHeader className="pt-6 pb-4">
            <CardTitle className="text-left text-2xl font-bold text-gray-900">Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-teal-600 hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded font-medium transition-colors"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: white cover exactly bottom 50vh */}
      <div className="w-full h-[50vh] bg-white" />
    </div>
  )
}
