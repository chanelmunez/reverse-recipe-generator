"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import { IngredientPopup } from "@/components/ui/ingredient-popup"
import { PopupManager } from "@/lib/popup-manager"

interface InteractiveIngredientProps {
  ingredient: {
    name: string
    imageUrl: string
  }
}

export function InteractiveIngredient({ ingredient }: InteractiveIngredientProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  
  // Create unique popup ID for this ingredient
  const popupId = `ingredient-popup-${ingredient.name.toLowerCase().replace(/\s+/g, '-')}`

  const openPopup = useCallback(() => {
    console.log('Attempting to open popup for:', ingredient.name)
    
    // Request to open this popup (PopupManager will force-close all others)
    if (PopupManager.requestOpen(popupId)) {
      console.log('PopupManager approved opening popup for:', ingredient.name)
      setIsPopupOpen(true)
    } else {
      console.log('PopupManager denied opening popup (already open):', ingredient.name)
    }
  }, [popupId, ingredient.name])

  const closePopup = useCallback(() => {
    console.log('Closing popup for:', ingredient.name, 'Current state:', isPopupOpen)
    setIsPopupOpen(false)
    setIsHovering(false) // Also reset hover state
    PopupManager.notifyClose(popupId)
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }, [hoverTimeout, popupId, ingredient.name, isPopupOpen])

  // Register/unregister popup with the global manager
  useEffect(() => {
    console.log('Registering popup with manager:', popupId)
    PopupManager.registerPopup(popupId, closePopup)
    
    return () => {
      console.log('Unregistering popup from manager:', popupId)
      PopupManager.unregisterPopup(popupId)
    }
  }, [popupId, closePopup])

  const handleMouseEnter = useCallback(() => {
    console.log('Mouse enter triggered', { isHovering, ingredient: ingredient.name })
    
    // Only trigger on desktop (non-touch devices)
    if (window.matchMedia('(hover: hover)').matches && !isHovering) {
      console.log('Setting hover state and timeout')
      setIsHovering(true)
      const timeout = setTimeout(() => {
        console.log('Timeout triggered, opening popup')
        openPopup()
      }, 500) // 500ms delay for hover
      setHoverTimeout(timeout)
    }
  }, [openPopup, isHovering, ingredient.name])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    
    // Close popup after a small delay to allow moving to popup
    setTimeout(() => {
      if (window.matchMedia('(hover: hover)').matches && !isHovering) {
        closePopup()
      }
    }, 200)
  }, [hoverTimeout, closePopup, isHovering])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Click triggered', { isPopupOpen, ingredient: ingredient.name })
    
    // For touch devices or when popup is already open
    if (!window.matchMedia('(hover: hover)').matches || isPopupOpen) {
      if (isPopupOpen) {
        console.log('Closing popup')
        closePopup()
      } else {
        console.log('Opening popup')
        openPopup()
      }
    } else {
      // On desktop with hover support, still allow click to open
      console.log('Desktop click - opening popup')
      openPopup()
    }
  }, [isPopupOpen, openPopup, closePopup, ingredient.name])

  return (
    <>
      <div 
        ref={triggerRef}
        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Get health information about ${ingredient.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (isPopupOpen) {
              closePopup()
            } else {
              openPopup()
            }
          }
        }}
      >
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-blue-200 transition-colors">
          <img
            src={ingredient.imageUrl || "/placeholder.svg"}
            alt={ingredient.name}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs mt-1.5 font-medium text-center">{ingredient.name}</p>
      </div>

      <IngredientPopup
        ingredient={ingredient.name}
        isOpen={isPopupOpen}
        onClose={closePopup}
        triggerRef={triggerRef}
      />
    </>
  )
}
