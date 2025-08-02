"use client"

import React, { useEffect, useRef, useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { IngredientHealthCache, type IngredientHealthInfo } from "@/lib/ingredient-health-cache"

interface IngredientPopupProps {
  ingredient: string
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
}

const healthRatingColors = {
  excellent: "text-green-600 bg-green-50 border-green-200",
  good: "text-blue-600 bg-blue-50 border-blue-200", 
  moderate: "text-yellow-600 bg-yellow-50 border-yellow-200",
  limited: "text-gray-600 bg-gray-50 border-gray-200"
}

const healthRatingLabels = {
  excellent: "Excellent",
  good: "Good", 
  moderate: "Moderate",
  limited: "Limited"
}

export function IngredientPopup({ ingredient, isOpen, onClose, triggerRef }: IngredientPopupProps) {
  const [healthInfo, setHealthInfo] = useState<IngredientHealthInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState<{ top: number; left: number; showAbove: boolean }>({
    top: 0,
    left: 0,
    showAbove: false
  })
  const [isPositioned, setIsPositioned] = useState(false)
  
  const popupRef = useRef<HTMLDivElement>(null)

  // Calculate smart positioning with delay to prevent jitter
  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setIsPositioned(false)
      return
    }

    // Reset positioned state when popup opens
    setIsPositioned(false)

    // Use setTimeout to ensure DOM measurements are accurate
    const positionTimeout = setTimeout(() => {
      if (!triggerRef.current || !popupRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popupRect = popupRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      
      // Use actual popup height if available, otherwise estimate
      const popupHeight = popupRect.height > 0 ? popupRect.height : 220
      const popupWidth = popupRect.width > 0 ? popupRect.width : 320
      
      // Determine if popup should show above or below
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const showAbove = spaceBelow < popupHeight + 16 && spaceAbove > spaceBelow

      // Calculate horizontal position (center on trigger, but keep in viewport)
      let left = triggerRect.left + (triggerRect.width / 2) - (popupWidth / 2)
      left = Math.max(16, Math.min(left, viewportWidth - popupWidth - 16))

      // Calculate vertical position with proper clearance
      const clearanceAbove = 24 // Extra clearance when showing above
      const clearanceBelow = 8  // Standard clearance when showing below
      
      const top = showAbove 
        ? triggerRect.top - popupHeight - clearanceAbove
        : triggerRect.bottom + clearanceBelow

      console.log('Setting popup position:', { top, left, showAbove, popupHeight, popupWidth })
      setPosition({ top, left, showAbove })
      setIsPositioned(true)
    }, 50) // 50ms delay to ensure DOM is ready

    return () => clearTimeout(positionTimeout)
  }, [isOpen, triggerRef])

  // Fetch health information using cache
  useEffect(() => {
    console.log('Popup useEffect triggered', { isOpen, ingredient })
    
    if (!isOpen || !ingredient) return

    const fetchHealthInfo = async () => {
      console.log('Starting to fetch health info for:', ingredient)
      setLoading(true)
      setError(null)
      
      try {
        // Use the caching system which handles deduplication and localStorage
        const data = await IngredientHealthCache.getIngredientHealth(ingredient)
        console.log('Health info fetched successfully:', data)
        setHealthInfo(data)
      } catch (err) {
        console.error("Error fetching ingredient health info:", err)
        setError("Unable to load health information")
      } finally {
        setLoading(false)
      }
    }

    fetchHealthInfo()
  }, [isOpen, ingredient])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScroll, true)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [isOpen, onClose, triggerRef])

  console.log('Popup render check', { isOpen, ingredient })
  
  if (!isOpen) {
    console.log('Popup not open, returning null')
    return null
  }
  
  console.log('Popup is open, rendering with position:', position)

  return (
    <div 
      ref={popupRef}
      className={`fixed z-50 w-80 bg-white transition-opacity duration-200 ${
        isPositioned ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: Math.max(0, position.top),
        left: Math.max(0, position.left),
      }}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-lg capitalize">{ingredient}</h4>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading health info...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {healthInfo && !loading && (
            <div className="space-y-3">
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${healthRatingColors[healthInfo.healthRating]}`}>
                {healthRatingLabels[healthInfo.healthRating]} for Health
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {healthInfo.healthBenefits}
              </p>

              <div>
                <h5 className="font-medium text-sm mb-2">Key Nutritional Benefits:</h5>
                <ul className="space-y-1">
                  {healthInfo.nutritionalHighlights.map((highlight, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arrow pointer */}
      <div 
        className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 ${
          position.showAbove 
            ? 'top-full border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white'
            : 'bottom-full border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white'
        }`}
      />
    </div>
  )
}
