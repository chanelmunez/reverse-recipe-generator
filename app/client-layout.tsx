"use client"

import type { ReactNode } from "react"
import { KonstaProvider } from "@/components/konsta-provider"

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <KonstaProvider>
      {children}
    </KonstaProvider>
  )
}
