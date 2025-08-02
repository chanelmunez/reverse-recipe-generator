"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImageUploader } from "@/components/features/image-uploader"
import { UserProfileForm } from "@/components/features/user-profile-form"
import { useUserProfile } from "@/hooks/use-user-profile"
import { Button } from "@/components/ui/button"
import type { UserProfile, ApiResponse } from "@/types"

function isProfileComplete(profile: UserProfile): boolean {
  return !!(
    profile.age &&
    profile.weight &&
    profile.height &&
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

  const isFormSubmittable = isProfileComplete(userProfile) && !!imageFile

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormSubmittable) return

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

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get a specific error message from the server, otherwise use a default.
        const errorText = await response.text()
        throw new Error(errorText || `Request failed with status ${response.status}`)
      }

      const result: ApiResponse = await response.json()

      if (result.status === "success") {
        localStorage.setItem(`report-${result.data.id}`, JSON.stringify(result.data))
        router.push(`/report/${result.data.id}`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      // Log the actual error to the console for better debugging.
      console.error("An error occurred during form submission:", err)
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred."
      // Try to parse a JSON error message from the error text itself
      try {
        const parsedError = JSON.parse(errorMessage)
        setError(parsedError.message || "An unexpected error occurred. Please try again.")
      } catch {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reverse Recipe Generator</h1>
          <p className="text-muted-foreground">Upload a meal photo to get your Food Intelligence Report.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <UserProfileForm disabled={isLoading} />
          <ImageUploader onImageUpload={setImageFile} disabled={isLoading} />

          <div className="text-center">
            <Button type="submit" disabled={!isFormSubmittable || isLoading} className="w-full sm:w-auto">
              {isLoading ? "Analyzing..." : "Generate Report"}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="text-center mt-4">
            <p>Generating your food intelligence report. This may take a moment...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 border border-destructive bg-destructive/10 text-destructive text-center">
            <p>{error}</p>
          </div>
        )}
      </div>
    </main>
  )
}
