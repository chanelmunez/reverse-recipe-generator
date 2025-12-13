"use client"

import React, { useState, useEffect } from "react"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { UnitSystem } from "@/types"
import {
  Block,
  BlockTitle,
  List,
  ListInput,
  ListItem,
  Segmented,
  SegmentedButton,
} from "konsta/react"

interface UserProfileFormProps {
  disabled?: boolean
}

export function UserProfileForm({ disabled = false }: UserProfileFormProps) {
  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useUserProfile()
  const isMetric = userProfile.unitSystem === "metric"

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleUnitChange = (value: UnitSystem) => {
    setUserProfile((prev) => ({
      ...prev,
      unitSystem: value,
      weight: null,
      height: null,
      heightInches: null,
    }))
  }

  const handleChange = (name: string, value: string) => {
    setUserProfile((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setUserProfile((prev) => ({ ...prev, [name]: value }))
  }

  if (!isClient) {
    return null
  }

  return (
    <Block>
      <BlockTitle>Your Profile (Optional)</BlockTitle>

      <Segmented strong className="mb-4">
        <SegmentedButton
          active={isMetric}
          onClick={() => handleUnitChange("metric")}
          disabled={disabled}
        >
          Metric (kg, cm)
        </SegmentedButton>
        <SegmentedButton
          active={!isMetric}
          onClick={() => handleUnitChange("imperial")}
          disabled={disabled}
        >
          Imperial (lbs, ft)
        </SegmentedButton>
      </Segmented>

      <List strongIos insetIos className="my-0">
        <ListInput
          label="Age"
          type="number"
          placeholder="e.g., 30"
          value={userProfile.age?.toString() || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("age", e.target.value)}
          disabled={disabled}
        />

        <ListInput
          label={`Weight (${isMetric ? "kg" : "lbs"})`}
          type="number"
          placeholder={isMetric ? "e.g., 70" : "e.g., 155"}
          value={userProfile.weight?.toString() || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("weight", e.target.value)}
          disabled={disabled}
        />

        {isMetric ? (
          <ListInput
            label="Height (cm)"
            type="number"
            placeholder="e.g., 175"
            value={userProfile.height?.toString() || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("height", e.target.value)}
            disabled={disabled}
          />
        ) : (
          <>
            <ListInput
              label="Height (ft)"
              type="number"
              placeholder="e.g., 5"
              value={userProfile.height?.toString() || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("height", e.target.value)}
              disabled={disabled}
            />
            <ListInput
              label="Height (in)"
              type="number"
              placeholder="e.g., 10"
              value={userProfile.heightInches?.toString() || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("heightInches", e.target.value)}
              disabled={disabled}
            />
          </>
        )}

        <ListItem
          label="Sex"
          title={
            userProfile.sex === "male" ? "Male" :
            userProfile.sex === "female" ? "Female" : "Select..."
          }
          link
          onClick={() => {
            if (disabled) return
            const options = ["male", "female"]
            const current = options.indexOf(userProfile.sex || "")
            const next = options[(current + 1) % options.length]
            handleSelectChange("sex", next)
          }}
        />

        <ListItem
          label="Activity Level"
          title={
            userProfile.activityLevel === "sedentary" ? "Sedentary" :
            userProfile.activityLevel === "light" ? "Lightly Active" :
            userProfile.activityLevel === "moderate" ? "Moderately Active" :
            userProfile.activityLevel === "active" ? "Active" :
            userProfile.activityLevel === "very_active" ? "Very Active" :
            userProfile.activityLevel === "extra_active" ? "Extra Active" : "Select..."
          }
          link
          onClick={() => {
            if (disabled) return
            const options = ["sedentary", "light", "moderate", "active", "very_active", "extra_active"]
            const current = options.indexOf(userProfile.activityLevel || "")
            const next = options[(current + 1) % options.length]
            handleSelectChange("activityLevel", next)
          }}
        />

        <ListItem
          label="Fitness Goal"
          title={
            userProfile.fitnessGoal === "weight_loss" ? "Weight Loss" :
            userProfile.fitnessGoal === "maintenance" ? "Maintenance" :
            userProfile.fitnessGoal === "muscle_gain" ? "Muscle Gain" : "Select..."
          }
          link
          onClick={() => {
            if (disabled) return
            const options = ["weight_loss", "maintenance", "muscle_gain"]
            const current = options.indexOf(userProfile.fitnessGoal || "")
            const next = options[(current + 1) % options.length]
            handleSelectChange("fitnessGoal", next)
          }}
        />
      </List>
    </Block>
  )
}
