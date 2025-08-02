"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ReportDisplay } from "../../../../components/features/report-display"
import type { FoodIntelligenceReport } from "../../../../types"

export default function ReportPage() {
  const params = useParams()
  const id = params.id as string
  const [report, setReport] = useState<FoodIntelligenceReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      try {
        const storedReport = localStorage.getItem(`report-${id}`)
        if (storedReport) {
          setReport(JSON.parse(storedReport))
        } else {
          setError("Report not found. It might have expired or was not generated correctly.")
        }
      } catch (e) {
        setError("Failed to load the report data.")
      }
    }
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
