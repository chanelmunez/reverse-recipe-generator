"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void
  disabled?: boolean
}

export function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [inputType, setInputType] = useState<"upload" | "camera" | "url">("upload")
  const [preview, setPreview] = useState<string | null>(null)
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRemoveImage = () => {
    // Revoke the object URL to free up memory if it's a blob URL
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }
    onImageUpload(null)
    setPreview(null)
    setUrl("")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // FIX: Do not call handleRemoveImage() here, as it clears the state prematurely.
    // The state will be overwritten by the new file anyway.
    const file = event.target.files?.[0]
    if (file) {
      setError(null) // Clear any previous errors
      onImageUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
    if (preview) {
      handleRemoveImage()
    }
  }

  const handleUrlSubmit = async () => {
    if (!url) {
      setError("Please enter a URL.")
      return
    }
    setIsLoadingUrl(true)
    setError(null)
    try {
      // Use our own API route to fetch the image, avoiding CORS issues.
      const response = await fetch(`/api/fetch-image?url=${encodeURIComponent(url)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch image. Status: ${response.status}`)
      }

      const blob = await response.blob()
      // Extract a filename from the URL, or default to a generic name
      const fileName = url.substring(url.lastIndexOf("/") + 1).split("?")[0] || "image.jpg"
      const imageFile = new File([blob], fileName, { type: blob.type })

      onImageUpload(imageFile)
      setPreview(URL.createObjectURL(blob)) // Create a temporary local URL for preview
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred."
      setError(`Could not load image from URL. ${message}`)
      onImageUpload(null)
      setPreview(null)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Provide Meal Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue="upload"
          onValueChange={(value: "upload" | "camera" | "url") => {
            setInputType(value as "upload" | "camera" | "url")
            handleRemoveImage() // Reset when switching modes
          }}
          className="mb-4 flex flex-wrap gap-4"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload">Choose File</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="camera" id="camera" />
            <Label htmlFor="camera">Take Photo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="url" />
            <Label htmlFor="url">From URL</Label>
          </div>
        </RadioGroup>

        {/* Helper text for mobile users */}
        {inputType === "camera" && (
          <p className="text-sm text-muted-foreground mb-3">
            📱 On mobile: This will open your camera to take a photo directly
          </p>
        )}
        {inputType === "upload" && (
          <p className="text-sm text-muted-foreground mb-3">
            📁 Choose from your device's files or photo gallery
          </p>
        )}

        {inputType === "upload" ? (
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        ) : inputType === "camera" ? (
          <div>
            <Input
              type="file"
              accept="image/*"
              capture="environment" // Mobile camera access - rear camera preferred
              onChange={handleFileChange}
              disabled={disabled}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Tip: Point your camera at the meal for best results
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={handleUrlInputChange}
              disabled={disabled || isLoadingUrl}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button onClick={handleUrlSubmit} disabled={disabled || isLoadingUrl || !url}>
              {isLoadingUrl ? "Loading..." : "Load"}
            </Button>
          </div>
        )}

        {error && <p className="text-destructive text-sm mt-2">{error}</p>}

        {preview && (
          <div className="mt-4 text-center">
            <img
              src={preview || "/placeholder.svg"}
              alt="Meal preview"
              className="max-w-full h-auto max-h-64 rounded-md inline-block"
            />
            <Button variant="link" onClick={handleRemoveImage} disabled={disabled} className="mt-2">
              Remove Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
