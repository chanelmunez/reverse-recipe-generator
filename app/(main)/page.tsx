"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/features/image-uploader"
import { UserProfileForm } from "@/components/features/user-profile-form"
import { useUserProfile } from "@/hooks/use-user-profile"
import { Loader2 } from "lucide-react"
import type { UserProfile, ApiResponse } from "@/types"

function isProfileComplete(profile: UserProfile): boolean {
  const isMetricComplete = profile.unitSystem === "metric" && profile.height
  const isImperialComplete =
    profile.unitSystem === "imperial" && profile.height && profile.heightInches !== null && profile.heightInches !== undefined
  const isHeightComplete = isMetricComplete || isImperialComplete

  return !!(
    profile.age &&
    profile.weight &&
    isHeightComplete &&
    profile.sex &&
    profile.activityLevel &&
    profile.fitnessGoal
  )
}

export default function HomePage() {
  const router = useRouter()
  const [userProfile] = useUserProfile()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submissionTriggered = useRef(false)

  const isFormSubmittable = !!imageFile

  const generateReport = async () => {
    if (!isFormSubmittable || submissionTriggered.current) return

    submissionTriggered.current = true
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", imageFile!)
    formData.append("userProfile", JSON.stringify(userProfile))

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        body: formData,
      })

      // First, get the response body as text to avoid JSON parsing errors on non-JSON responses.
      const responseText = await response.text()

      if (!response.ok) {
        // If the server returned an error, try to parse it as our structured error.
        // If that fails, use the raw text as the error message.
        try {
          const errorJson = JSON.parse(responseText)
          throw new Error(errorJson.message || "An unknown API error occurred.")
        } catch {
          throw new Error(responseText || `Request failed with status ${response.status}`)
        }
      }

      const result: ApiResponse = JSON.parse(responseText)

      if (result.status === "success") {
        // Store the full report initially in localStorage for first-time viewing
        const { StorageManager } = await import("@/lib/storage-manager")
        StorageManager.storeFullReport(result.data.id, result.data)
        
        router.push(`/report/${result.data.id}`)
      } else {
        // This handles cases where the API returns a 200 OK status but with a logical error.
        setError(result.message)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("An error occurred during form submission:", err)
      const displayMessage = err instanceof Error ? err.message : "An unknown error occurred."
      setError(displayMessage)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    submissionTriggered.current = false
    if (isFormSubmittable && !isLoading) {
      generateReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, imageFile])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    generateReport()
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reverse Recipe Generator</h1>
          <p className="text-muted-foreground">Upload a meal photo to begin. Profile information is optional for personalized results.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <UserProfileForm disabled={isLoading} />
          <ImageUploader onImageUpload={setImageFile} disabled={isLoading} />
        </form>

        <div className="mt-8 text-center h-16 flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Generating your report... This may take a moment.</span>
            </div>
          ) : error ? (
            <div className="p-4 border border-destructive bg-destructive/10 text-destructive text-center w-full rounded-md">
              <p>{error}</p>
            </div>
          ) : !isFormSubmittable ? (
            <p className="text-muted-foreground">Please provide a meal photo to continue.</p>
          ) : null}
        </div>
      </div>
    </main>
  )
}
