/**
 * Report storage using Capacitor Filesystem for native apps
 * Falls back to localStorage for web
 */

import type { FoodIntelligenceReport } from "@/types"

interface StoredReport {
  id: string
  name: string
  description: string
  timestamp: number
  healthScore?: number
  data: FoodIntelligenceReport
}

class ReportStorageService {
  private isNative = false
  private Filesystem: any = null
  private Directory: any = null
  private initialized = false

  async init() {
    if (this.initialized) return

    // Check if running in Capacitor
    if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.()) {
      try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem")
        this.Filesystem = Filesystem
        this.Directory = Directory
        this.isNative = true

        // Ensure reports directory exists
        try {
          await this.Filesystem.mkdir({
            path: "reports",
            directory: this.Directory.Data,
            recursive: true,
          })
        } catch (e: any) {
          // Directory might already exist
          if (!e.message?.includes("exists")) {
            console.error("Error creating reports directory:", e)
          }
        }
      } catch (e) {
        console.error("Failed to initialize Filesystem:", e)
        this.isNative = false
      }
    }

    this.initialized = true
  }

  async saveReport(report: FoodIntelligenceReport): Promise<void> {
    await this.init()

    const storedReport: StoredReport = {
      id: report.id,
      name: report.recipe?.name || "Unknown Recipe",
      description: report.recipe?.description || "",
      timestamp: Date.now(),
      healthScore: report.fitnessGoalAnalysis?.healthScore,
      data: {
        ...report,
        imageUrl: "", // Don't store large base64 images
      },
    }

    if (this.isNative) {
      try {
        await this.Filesystem.writeFile({
          path: `reports/${report.id}.json`,
          data: JSON.stringify(storedReport),
          directory: this.Directory.Data,
          encoding: "utf8",
        })
        console.log("Report saved to file:", report.id)
      } catch (e) {
        console.error("Error saving report to file:", e)
        // Fallback to localStorage
        this.saveToLocalStorage(storedReport)
      }
    } else {
      this.saveToLocalStorage(storedReport)
    }
  }

  private saveToLocalStorage(storedReport: StoredReport): void {
    try {
      localStorage.setItem(`report-${storedReport.id}`, JSON.stringify(storedReport))
    } catch (e) {
      console.error("Error saving to localStorage:", e)
    }
  }

  async getReport(id: string): Promise<FoodIntelligenceReport | null> {
    await this.init()

    if (this.isNative) {
      try {
        const result = await this.Filesystem.readFile({
          path: `reports/${id}.json`,
          directory: this.Directory.Data,
          encoding: "utf8",
        })
        const stored: StoredReport = JSON.parse(result.data)
        return stored.data
      } catch (e) {
        console.log("Report not found in files, trying localStorage")
        return this.getFromLocalStorage(id)
      }
    } else {
      return this.getFromLocalStorage(id)
    }
  }

  private getFromLocalStorage(id: string): FoodIntelligenceReport | null {
    try {
      const data = localStorage.getItem(`report-${id}`)
      if (data) {
        const stored = JSON.parse(data)
        return stored.data || stored // Handle both old and new format
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e)
    }
    return null
  }

  async getAllReports(): Promise<StoredReport[]> {
    await this.init()

    const reports: StoredReport[] = []

    if (this.isNative) {
      try {
        const result = await this.Filesystem.readdir({
          path: "reports",
          directory: this.Directory.Data,
        })

        for (const file of result.files) {
          if (file.name.endsWith(".json")) {
            try {
              const content = await this.Filesystem.readFile({
                path: `reports/${file.name}`,
                directory: this.Directory.Data,
                encoding: "utf8",
              })
              const stored: StoredReport = JSON.parse(content.data)
              reports.push(stored)
            } catch (e) {
              console.error("Error reading report file:", file.name, e)
            }
          }
        }
      } catch (e) {
        console.error("Error reading reports directory:", e)
      }
    }

    // Also check localStorage for any reports
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("report-")) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const parsed = JSON.parse(data)
            // Handle both old format (FoodIntelligenceReport) and new format (StoredReport)
            const stored: StoredReport = parsed.data
              ? parsed
              : {
                  id: parsed.id,
                  name: parsed.recipe?.name || "Unknown Recipe",
                  description: parsed.recipe?.description || "",
                  timestamp: parsed.timestamp || Date.now(),
                  healthScore: parsed.fitnessGoalAnalysis?.healthScore,
                  data: parsed,
                }
            // Avoid duplicates
            if (!reports.find((r) => r.id === stored.id)) {
              reports.push(stored)
            }
          }
        } catch (e) {
          console.error("Error parsing localStorage report:", key, e)
        }
      }
    }

    // Sort by timestamp, newest first
    reports.sort((a, b) => b.timestamp - a.timestamp)
    return reports
  }

  async deleteReport(id: string): Promise<void> {
    await this.init()

    if (this.isNative) {
      try {
        await this.Filesystem.deleteFile({
          path: `reports/${id}.json`,
          directory: this.Directory.Data,
        })
      } catch (e) {
        console.log("File not found, trying localStorage")
      }
    }

    // Also remove from localStorage
    localStorage.removeItem(`report-${id}`)
  }

  async deleteAllReports(): Promise<void> {
    await this.init()

    if (this.isNative) {
      try {
        const result = await this.Filesystem.readdir({
          path: "reports",
          directory: this.Directory.Data,
        })

        for (const file of result.files) {
          if (file.name.endsWith(".json")) {
            await this.Filesystem.deleteFile({
              path: `reports/${file.name}`,
              directory: this.Directory.Data,
            })
          }
        }
      } catch (e) {
        console.error("Error deleting report files:", e)
      }
    }

    // Also clear localStorage reports
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("report-")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }
}

export const ReportStorage = new ReportStorageService()
