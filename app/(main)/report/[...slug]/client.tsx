"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Page, Navbar, NavbarBackLink, Block, Preloader } from "konsta/react"
import { ReportDisplay } from "@/components/features/report-display"
import type { FoodIntelligenceReport } from "@/types"

export default function ReportPageClient() {
  const params = useParams()
  const router = useRouter()
  // Catch-all route: slug is an array, first element is the report ID
  const slug = params.slug as string[]
  const id = slug?.[0]
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
        <Navbar title="Loading..." />
        <Block className="flex flex-col items-center justify-center py-12">
          <Preloader />
          <p className="mt-4 text-gray-500">Loading report...</p>
        </Block>
      </Page>
    )
  }

  return <ReportDisplay report={report} />
}
