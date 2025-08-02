"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { UserProfile } from "@/types"

const initialProfile: UserProfile = {
  age: null,
  weight: null,
  height: null,
  heightInches: null,
  sex: "",
  activityLevel: "",
  fitnessGoal: "",
  unitSystem: "imperial", // Default to imperial
}

const STORAGE_KEY = "userProfile"

export function useUserProfile(): [UserProfile, React.Dispatch<React.SetStateAction<UserProfile>>] {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window === "undefined") {
      return initialProfile
    }
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      // Ensure the loaded profile has a unitSystem, defaulting to imperial if not
      const parsed = item ? JSON.parse(item) : initialProfile
      if (!parsed.unitSystem) {
        parsed.unitSystem = "imperial"
      }
      return parsed
    } catch (error) {
      console.error("Error reading from localStorage", error)
      return initialProfile
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile))
    } catch (error) {
      console.error("Error writing to localStorage", error)
    }
  }, [userProfile])

  return [userProfile, setUserProfile]
}
