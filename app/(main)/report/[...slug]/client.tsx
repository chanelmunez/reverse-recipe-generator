"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Page, Navbar, NavbarBackLink, Block, Preloader } from "konsta/react"
import { ReportDisplay } from "@/components/features/report-display"
import type { FoodIntelligenceReport } from "@/types"

// Log immediately when module loads
if (typeof window !== 'undefined') {
  console.log("=== REPORT CLIENT MODULE LOADED ===")
}

export default function ReportPageClient() {
  console.log("=== ReportPageClient FUNCTION CALLED ===")
  const router = useRouter()
  const [report, setReport] = useState<FoodIntelligenceReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("=== Report page useEffect running ===")

    // Get report ID from localStorage (set during navigation)
    const id = localStorage.getItem('currentReportId')
    console.log("Got currentReportId from localStorage:", id)

    async function loadReport() {
      if (id) {
        console.log("Loading report for id:", id)
        try {
          // Use ReportStorage which handles both file and localStorage
          const { ReportStorage } = await import("@/lib/report-storage")
          const reportData = await ReportStorage.getReport(id)
          console.log("Got report data:", reportData ? "yes" : "no")

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
  }, []) // Run once on mount

  if (error) {
    return (
      <Page>
        <Navbar
          title="Error"
          left={<NavbarBackLink onClick={() => router.push("/")} />}
        />
        <Block className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </Block>
      </Page>
    )
  }

  if (!report) {
    return (
      <Page>
        <Block className="flex flex-col items-center justify-center py-12">
          <Preloader />
          <p className="mt-4 text-gray-500">Loading report...</p>
        </Block>
      </Page>
    )
  }

  return <ReportDisplay report={report} />
}
