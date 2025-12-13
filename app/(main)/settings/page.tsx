"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Page,
  List,
  ListItem,
  Toggle,
  BlockTitle,
} from "konsta/react"
import { ChevronLeft, UtensilsCrossed, Trash2 } from "lucide-react"
import { ReportDisplay } from "@/components/features/report-display"
import type { FoodIntelligenceReport } from "@/types"

interface SavedReport {
  id: string
  name: string
  description: string
  timestamp: number
  healthScore?: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [keepAllReports, setKeepAllReports] = useState(false)
  const [reports, setReports] = useState<SavedReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeReport, setActiveReport] = useState<FoodIntelligenceReport | null>(null)

  useEffect(() => {
    // Load setting
    const saved = localStorage.getItem("keepAllReports")
    if (saved) {
      setKeepAllReports(saved === "true")
    }

    // Load all saved reports
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const { ReportStorage } = await import("@/lib/report-storage")
      const allReports = await ReportStorage.getAllReports()
      setReports(allReports.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        timestamp: r.timestamp,
        healthScore: r.healthScore,
      })))
    } catch (e) {
      console.error("Error loading reports:", e)
    }
    setIsLoading(false)
  }

  const handleToggleChange = (value: boolean) => {
    setKeepAllReports(value)
    localStorage.setItem("keepAllReports", value.toString())
  }

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const { ReportStorage } = await import("@/lib/report-storage")
    await ReportStorage.deleteReport(id)
    loadReports()
  }

  const handleOpenReport = async (id: string) => {
    // Load report and show inline (avoids navigation issues in Capacitor)
    const { ReportStorage } = await import("@/lib/report-storage")
    const reportData = await ReportStorage.getReport(id)
    if (reportData) {
      setActiveReport(reportData)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-200"
    if (score >= 80) return "bg-emerald-500"
    if (score >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  // Show report inline if one is selected
  if (activeReport) {
    return <ReportDisplay report={activeReport} onBack={() => setActiveReport(null)} />
  }

  return (
    <Page>
      {/* Custom header with safe area */}
      <div className="safe-area-top bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => window.location.href = "/"}
            className="p-2 -ml-2 mr-2"
          >
            <ChevronLeft className="w-7 h-7 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Storage Settings */}
      <div className="px-4">
        <BlockTitle>Storage</BlockTitle>
      </div>
      <List strongIos insetIos className="mx-4">
        <ListItem
          title="Keep All Reports"
          subtitle="Disable auto-cleanup of old reports"
          after={
            <Toggle
              checked={keepAllReports}
              onChange={() => handleToggleChange(!keepAllReports)}
            />
          }
        />
      </List>

      {/* Saved Reports */}
      <div className="px-4 mt-6">
        <BlockTitle>Saved Reports ({reports.length})</BlockTitle>
      </div>
      {reports.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No saved reports yet</p>
          <p className="text-sm mt-1">Analyze a meal to see it here</p>
        </div>
      ) : (
        <List strongIos insetIos className="mx-4">
          {reports.map((report) => (
            <ListItem
              key={report.id}
              onClick={() => handleOpenReport(report.id)}
              media={
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getScoreColor(report.healthScore)}`}>
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
              }
              title={report.name}
              subtitle={formatDate(report.timestamp)}
              after={
                <button
                  onClick={(e) => handleDeleteReport(report.id, e)}
                  className="p-2 text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              }
            />
          ))}
        </List>
      )}

      {/* Clear All */}
      {reports.length > 0 && (
        <>
          <div className="px-4 mt-8">
            <BlockTitle>Danger Zone</BlockTitle>
          </div>
          <List strongIos insetIos className="mx-4">
            <ListItem
              title={<span className="text-red-500">Clear All Reports</span>}
              onClick={async () => {
                if (confirm("Delete all saved reports? This cannot be undone.")) {
                  const { ReportStorage } = await import("@/lib/report-storage")
                  await ReportStorage.deleteAllReports()
                  loadReports()
                }
              }}
            />
          </List>
        </>
      )}
    </Page>
  )
}
