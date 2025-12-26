import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Dancing_Script, Pacifico, Poppins, Cookie } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
})

const pacifico = Pacifico({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-pacifico",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300","400","600","700"],
  variable: "--font-poppins",
})

const cookie = Cookie({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-cookie",
})

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Comprehensive employee management solution",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
  <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${dancingScript.variable} ${poppins.variable} ${pacifico.variable} ${cookie.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
