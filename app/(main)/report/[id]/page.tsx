"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ReportDisplay } from "@/components/features/report-display"
import type { FoodIntelligenceReport } from "@/types"

export default function ReportPage() {
  const params = useParams()
  const id = params.id as string
  const [report, setReport] = useState<FoodIntelligenceReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReport() {
      if (id) {
        try {
          // Use StorageManager which automatically handles first-time vs subsequent viewing
          const { StorageManager } = await import("@/lib/storage-manager")
          const reportData = StorageManager.getReport(id)
          
          if (reportData) {
            setReport(reportData)
          } else {
            setError("Report not found. It might have expired or was automatically cleaned up to free storage space.")
          }
        } catch (e) {
          console.error('Error loading report:', e)
          setError("Failed to load the report data.")
        }
      }
    }
    
    loadReport()
  }, [id])

  if (error) {
    return (
      <main className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p>{error}</p>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="container mx-auto p-8 text-center">
        <p>Loading report...</p>
      </main>
    )
  }

  return <ReportDisplay report={report} />
}
