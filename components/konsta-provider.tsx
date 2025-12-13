"use client"

import { App } from "konsta/react"
import type { ReactNode } from "react"

interface KonstaProviderProps {
  children: ReactNode
}

export function KonstaProvider({ children }: KonstaProviderProps) {
  return (
    <App
      theme="ios"
      safeAreas
      dark={false}
      className="min-h-screen bg-white"
    >
      {children}
    </App>
  )
}
