import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ClientLayout } from "./client-layout"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Recipe",
  description: "Upload a photo of a meal and get a full food intelligence report.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recipe",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", inter.variable)}>
        <Suspense fallback={null}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Suspense>
        <GoogleAnalytics gaId="G-EH8GZV6VKS" />
      </body>
    </html>
  )
}
