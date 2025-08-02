"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { UserProfile } from "@/types"

const initialProfile: UserProfile = {
  age: null,
  weight: null,
  height: null,
  sex: "",
  activityLevel: "",
  fitnessGoal: "",
}

const STORAGE_KEY = "userProfile"

export function useUserProfile(): [UserProfile, React.Dispatch<React.SetStateAction<UserProfile>>] {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    // Read initial state from localStorage synchronously on the client.
    // This avoids a flicker where the form is briefly empty.
    if (typeof window === "undefined") {
      return initialProfile
    }
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      return item ? JSON.parse(item) : initialProfile
    } catch (error) {
      console.error("Error reading from localStorage", error)
      return initialProfile
    }
  })

  // This effect syncs any changes back to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile))
    } catch (error) {
      console.error("Error writing to localStorage", error)
    }
  }, [userProfile])

  return [userProfile, setUserProfile]
}
