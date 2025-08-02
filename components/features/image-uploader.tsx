"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void
  disabled?: boolean
}

export function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      onImageUpload(null)
      setPreview(null)
    }
  }

  const handleRemoveImage = () => {
    onImageUpload(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload Meal Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="mb-4"
        />
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
