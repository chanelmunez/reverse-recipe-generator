"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  Block,
  BlockTitle,
  Segmented,
  SegmentedButton,
  List,
  ListInput,
  Button,
} from "konsta/react"
import { Camera as CameraIcon, Upload, Link } from "lucide-react"
import { getApiUrl } from "@/lib/utils"

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void
  disabled?: boolean
}

// Helper to convert base64 to File
async function base64ToFile(base64: string, filename: string): Promise<File> {
  const res = await fetch(base64)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}

// Check if running in Capacitor native environment
function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.()
}

export function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [inputType, setInputType] = useState<"upload" | "camera" | "url">("camera")
  const [preview, setPreview] = useState<string | null>(null)
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRemoveImage = () => {
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
    const file = event.target.files?.[0]
    if (file) {
      setError(null)
      onImageUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Native camera capture using Capacitor
  const handleNativeCamera = async () => {
    if (disabled || isCapturing) return

    setIsCapturing(true)
    setError(null)

    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera")

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: inputType === "camera" ? CameraSource.Camera : CameraSource.Photos,
        correctOrientation: true,
      })

      if (photo.dataUrl) {
        const file = await base64ToFile(photo.dataUrl, `photo-${Date.now()}.jpg`)
        onImageUpload(file)
        setPreview(photo.dataUrl)
      }
    } catch (err: any) {
      // User cancelled is not an error
      if (err?.message?.includes("cancelled") || err?.message?.includes("canceled")) {
        return
      }
      const message = err instanceof Error ? err.message : "Failed to capture photo"
      setError(message)
      console.error("Camera error:", err)
    } finally {
      setIsCapturing(false)
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
      const response = await fetch(getApiUrl(`/api/fetch-image?url=${encodeURIComponent(url)}`))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch image. Status: ${response.status}`)
      }

      const blob = await response.blob()
      const fileName = url.substring(url.lastIndexOf("/") + 1).split("?")[0] || "image.jpg"
      const imageFile = new File([blob], fileName, { type: blob.type })

      onImageUpload(imageFile)
      setPreview(URL.createObjectURL(blob))
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred."
      setError(`Could not load image from URL. ${message}`)
      onImageUpload(null)
      setPreview(null)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  // Decide whether to use native camera or HTML input
  const handleCameraClick = () => {
    if (isCapacitor()) {
      handleNativeCamera()
    } else {
      // Fallback to HTML file input
      fileInputRef.current?.click()
    }
  }

  return (
    <Block>
      <BlockTitle>Meal Photo</BlockTitle>

      <Segmented strong className="mb-4">
        <SegmentedButton
          active={inputType === "camera"}
          onClick={() => {
            setInputType("camera")
            handleRemoveImage()
          }}
          disabled={disabled}
        >
          <CameraIcon className="w-4 h-4 mr-1" />
          Camera
        </SegmentedButton>
        <SegmentedButton
          active={inputType === "upload"}
          onClick={() => {
            setInputType("upload")
            handleRemoveImage()
          }}
          disabled={disabled}
        >
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </SegmentedButton>
        <SegmentedButton
          active={inputType === "url"}
          onClick={() => {
            setInputType("url")
            handleRemoveImage()
          }}
          disabled={disabled}
        >
          <Link className="w-4 h-4 mr-1" />
          URL
        </SegmentedButton>
      </Segmented>

      {inputType === "url" ? (
        <List strongIos insetIos className="my-0">
          <ListInput
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            disabled={disabled || isLoadingUrl}
            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleUrlSubmit()}
          />
          <div className="px-4 pb-4">
            <Button
              onClick={handleUrlSubmit}
              disabled={disabled || isLoadingUrl || !url}
              className="w-full"
            >
              {isLoadingUrl ? "Loading..." : "Load Image"}
            </Button>
          </div>
        </List>
      ) : (
        <div className="px-4">
          <div
            onClick={handleCameraClick}
            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="text-center">
              {isCapturing ? (
                <p className="text-sm text-gray-500">Opening camera...</p>
              ) : inputType === "camera" ? (
                <>
                  <CameraIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Tap to take photo</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Tap to choose file</p>
                </>
              )}
            </div>
          </div>
          {/* Hidden file input for web fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture={inputType === "camera" ? "environment" : undefined}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2 px-4">{error}</p>
      )}

      {preview && (
        <div className="mt-4 px-4 text-center">
          <img
            src={preview}
            alt="Meal preview"
            className="max-w-full h-auto max-h-64 rounded-lg inline-block shadow-md"
          />
          <Button
            clear
            onClick={handleRemoveImage}
            disabled={disabled}
            className="mt-2"
          >
            Remove Image
          </Button>
        </div>
      )}
    </Block>
  )
}
