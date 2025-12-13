"use client"

import React from "react"

interface InteractiveIngredientProps {
  ingredient: {
    name: string
    imageUrl: string
  }
}

export function InteractiveIngredient({ ingredient }: InteractiveIngredientProps) {
  return (
    <div className="flex-shrink-0 w-20">
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
        <img
          src={ingredient.imageUrl || "/placeholder.svg"}
          alt={ingredient.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-xs mt-1.5 font-medium text-center text-gray-700 truncate">
        {ingredient.name}
      </p>
    </div>
  )
}
