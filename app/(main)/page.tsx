"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Page, Navbar, Block, Button, Preloader } from "konsta/react"
import { Camera, Image, Settings } from "lucide-react"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { ApiResponse } from "@/types"
import { getApiUrl } from "@/lib/utils"

// Food plate icon component
function FoodIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      {/* Plate */}
      <ellipse cx="32" cy="36" rx="26" ry="12" />
      <ellipse cx="32" cy="36" rx="20" ry="8" />
      {/* Food items on plate */}
      <circle cx="26" cy="34" r="4" fill="currentColor" />
      <circle cx="38" cy="33" r="5" fill="currentColor" />
      <path d="M30 30 Q32 26 34 30" strokeLinecap="round" />
      {/* Steam lines */}
      <path d="M24 24 Q22 20 24 16" strokeLinecap="round" />
      <path d="M32 22 Q30 18 32 14" strokeLinecap="round" />
      <path d="M40 24 Q38 20 40 16" strokeLinecap="round" />
    </svg>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [userProfile] = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

      const result: ApiResponse = JSON.parse(responseText)

      if (result.status === "success") {
        const { StorageManager } = await import("@/lib/storage-manager")
        StorageManager.storeFullReport(result.data.id, result.data)
        router.push(`/report/${result.data.id}`)
      } else {
        setError(result.message)
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error("API Error:", err)
      console.error("Error name:", err?.name)
      console.error("Error message:", err?.message)
      console.error("Error stack:", err?.stack)

      let errorMessage = "Failed to analyze image"
      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Network error - please check your connection"
      } else if (err?.message) {
        errorMessage = err.message
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

  return (
    <Page>
      <Navbar
        title="Recipe"
        large
        transparent
        right={
          <button
            className="p-2"
            onClick={() => router.push("/settings")}
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        }
      />

      <div className="flex flex-col items-center justify-center px-6 pt-8">
        {/* Icon and explainer */}
        <FoodIcon className="w-20 h-20 text-gray-800 mb-6" />

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Food Intelligence
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
