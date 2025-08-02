"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { UserProfile } from "../types"

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
    // This function runs only on initial render.
    // We check for window to ensure it's client-side, but useEffect is safer.
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

  useEffect(() => {
    // This effect runs only on the client, after the component mounts.
    // It syncs the state with localStorage whenever it changes.
    try {
      // FUTURE UPGRADE: Replace this localStorage logic with a database call.
      // For example, you might have a function like `saveUserProfileToDB(userProfile)`
      // that you call here. You would also fetch the initial profile from the DB.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile))
    } catch (error) {
      console.error("Error writing to localStorage", error)
    }
  }, [userProfile])

  return [userProfile, setUserProfile]
}
