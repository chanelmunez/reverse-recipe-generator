"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Page, Navbar, Block, Button, Preloader, Link } from "konsta/react"
import { Camera, Image, Settings } from "lucide-react"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { ApiResponse, FoodIntelligenceReport } from "@/types"
import { getApiUrl } from "@/lib/utils"
import { ReportDisplay } from "@/components/features/report-display"

// Responsive meal hero image component
function MealHero({ className }: { className?: string }) {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet="/images/meal-hero-320.webp 320w, /images/meal-hero-640.webp 640w, /images/meal-hero-960.webp 960w"
        sizes="(max-width: 400px) 320px, (max-width: 800px) 640px, 960px"
      />
      <img
        src="/images/meal-hero-640.png"
        srcSet="/images/meal-hero-320.png 320w, /images/meal-hero-640.png 640w"
        sizes="(max-width: 400px) 320px, 640px"
        alt="Delicious meal"
        className={className}
        loading="eager"
      />
    </picture>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [userProfile] = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<FoodIntelligenceReport | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Check if running in Capacitor
  const isCapacitor = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.()

  const processImage = async (file: File) => {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", file)
    formData.append("userProfile", JSON.stringify(userProfile))

    const apiUrl = getApiUrl("/api/generate-report")
    console.log("Calling API:", apiUrl)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      })

      console.log("API response status:", response.status)
      const responseText = await response.text()
      console.log("API response (first 200 chars):", responseText.slice(0, 200))

      if (!response.ok) {
        try {
          const errorJson = JSON.parse(responseText)
          throw new Error(errorJson.message || "An unknown API error occurred.")
        } catch {
          throw new Error(responseText || `Request failed with status ${response.status}`)
        }
      }

      let result: ApiResponse = JSON.parse(responseText)

      // CapacitorHttp may wrap response differently - handle both formats
      if (!result.status && result.data) {
        // Response might be wrapped: {data: {actual response}}
        result = { status: "success", data: result.data } as ApiResponse
      }

      console.log("Parsed result status:", result.status)

      if (result.status === "success") {
        console.log("Success! Showing report inline")

        // Save report to persistent storage
        const { ReportStorage } = await import("@/lib/report-storage")
        await ReportStorage.saveReport(result.data)

        // For Capacitor: show report inline (avoids navigation/hydration issues)
        // For web: can navigate or show inline
        if (isCapacitor) {
          setReport(result.data)
          setIsLoading(false)
        } else {
          localStorage.setItem("currentReportId", result.data.id)
          router.push(`/report/${result.data.id}`)
        }
      } else {
        // Map API error messages to user-friendly messages
        let errorMessage = result.message || "Something went wrong. Please try again."
        const msg = errorMessage.toLowerCase()

        if (msg.includes("no object generated") || msg.includes("did not match schema")) {
          errorMessage = "Couldn't identify a meal in this image. Please try a clearer photo of food."
        } else if (msg.includes("no food") || msg.includes("not food")) {
          errorMessage = "No meal detected. Please take a photo of food."
        }

        setError(errorMessage)
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error("API Error:", err)
      console.error("Error name:", err?.name)
      console.error("Error message:", err?.message)
      console.error("Error stack:", err?.stack)

      // Map technical errors to user-friendly messages
      let errorMessage = "Unable to analyze this image. Please try another photo."
      const errMsg = err?.message?.toLowerCase() || ""

      if (err instanceof TypeError && errMsg.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (errMsg.includes("no object generated") || errMsg.includes("did not match schema")) {
        errorMessage = "Couldn't identify a meal in this image. Please try a clearer photo of food."
      } else if (errMsg.includes("no food") || errMsg.includes("not food")) {
        errorMessage = "No meal detected. Please take a photo of food."
      } else if (errMsg.includes("timeout") || errMsg.includes("timed out")) {
        errorMessage = "Request timed out. Please try again."
      } else if (errMsg.includes("rate limit") || errMsg.includes("too many")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleCameraCapture = async () => {
    if (isCapacitor) {
      try {
        const { Camera: CapCamera, CameraResultType, CameraSource } = await import("@capacitor/camera")
        const photo = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          correctOrientation: true,
        })

        if (!photo.dataUrl) {
          console.error("No dataUrl in photo response:", JSON.stringify(photo).slice(0, 200))
          setError("Failed to get image data from camera")
          return
        }

        const res = await fetch(photo.dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" })
        processImage(file)
      } catch (err: any) {
        console.error("Camera error:", err, JSON.stringify(err))
        if (!err?.message?.includes("cancel") && !err?.message?.includes("User cancelled")) {
          setError(err?.message || "Failed to capture photo")
        }
      }
    } else {
      cameraInputRef.current?.click()
    }
  }

  const handlePhotoPicker = async () => {
    if (isCapacitor) {
      try {
        const { Camera: CapCamera, CameraResultType, CameraSource } = await import("@capacitor/camera")
        const photo = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
          correctOrientation: true,
        })

        if (!photo.dataUrl) {
          console.error("No dataUrl in photo response:", JSON.stringify(photo).slice(0, 200))
          setError("Failed to get image data from photo")
          return
        }

        const res = await fetch(photo.dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" })
        processImage(file)
      } catch (err: any) {
        console.error("Photo picker error:", err, JSON.stringify(err))
        if (!err?.message?.includes("cancel") && !err?.message?.includes("User cancelled")) {
          setError(err?.message || "Failed to select photo")
        }
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  // If we have a report, show it
  if (report) {
    return <ReportDisplay report={report} onBack={() => setReport(null)} />
  }

  return (
    <Page>
      {/* Custom header with safe area */}
      <div className="safe-area-top bg-white">
        <div className="max-w-xs mx-auto w-full flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Forked</h1>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 -mr-2"
          >
            <Settings className="w-8 h-8 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-6 pt-8">
        {/* Icon and explainer */}
        <MealHero className="w-32 h-auto mb-6 rounded-2xl" />

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Meal Intelligence
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-xs">
          Snap a photo of any meal to get nutritional info, recipes, and health insights.
        </p>

        {/* Action buttons */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <Preloader />
            <p className="text-gray-500">Analyzing your meal...</p>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-3">
            <Button
              large
              onClick={handleCameraCapture}
              className="w-full"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>

            <Button
              large
              outline
              onClick={handlePhotoPicker}
              className="w-full"
            >
              <Image className="w-5 h-5 mr-2" />
              Choose from Library
            </Button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm max-w-xs">
            {error}
          </div>
        )}

        {/* Hidden file inputs for web fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </Page>
  )
}
