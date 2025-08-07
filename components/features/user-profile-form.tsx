"use client"

import React, { useState, useEffect } from "react"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { UnitSystem } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserProfileFormProps {
  disabled?: boolean
}

export function UserProfileForm({ disabled = false }: UserProfileFormProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  const [userProfile, setUserProfile] = useUserProfile()
  const isMetric = userProfile.unitSystem === "metric"

  const handleUnitChange = (value: UnitSystem) => {
    setUserProfile((prev) => ({
      ...prev,
      unitSystem: value,
      // Reset weight and height to avoid misinterpretation of values
      weight: null,
      height: null,
      heightInches: null,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserProfile((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
  }

  const handleSelectChange = (name: keyof typeof userProfile) => (value: string) => {
    setUserProfile((prev) => ({ ...prev, [name]: value }))
  }

  if (!isClient) {
    // You can render a loader or skeleton here if you want
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unitSystem">Unit System</Label>
          <Select
            name="unitSystem"
            value={userProfile.unitSystem}
            onValueChange={(value) => handleUnitChange(value as UnitSystem)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (kg, cm)</SelectItem>
              <SelectItem value="imperial">Imperial (lbs, ft/in)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              placeholder="e.g., 30"
              value={userProfile.age || ""}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight ({isMetric ? "kg" : "lbs"})</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              placeholder={isMetric ? "e.g., 70" : "e.g., 155"}
              value={userProfile.weight || ""}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="height">Height ({isMetric ? "cm" : "ft and in"})</Label>
            {isMetric ? (
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="e.g., 175"
                value={userProfile.height || ""}
                onChange={handleChange}
                disabled={disabled}
              />
            ) : (
              <div className="flex gap-2">
                <Input
                  id="height"
                  name="height"
                  type="number"
                  placeholder="ft"
                  value={userProfile.height || ""}
                  onChange={handleChange}
                  disabled={disabled}
                />
                <Input
                  id="heightInches"
                  name="heightInches"
                  type="number"
                  placeholder="in"
                  value={userProfile.heightInches || ""}
                  onChange={handleChange}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select
              name="sex"
              value={userProfile.sex || ""}
              onValueChange={handleSelectChange("sex")}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select
              name="activityLevel"
              value={userProfile.activityLevel || ""}
              onValueChange={handleSelectChange("activityLevel")}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Lightly active</SelectItem>
                <SelectItem value="moderate">Moderately active</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="very_active">Very Active</SelectItem>
                {/* FIX: Changed value to 'extra_active' to match API */}
                <SelectItem value="extra_active">Extra Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fitnessGoal">Fitness Goal</Label>
            <Select
              name="fitnessGoal"
              value={userProfile.fitnessGoal || ""}
              onValueChange={handleSelectChange("fitnessGoal")}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fitness goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
