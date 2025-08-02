"use client"

import type React from "react"
import { useUserProfile } from "@/hooks/use-user-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserProfileFormProps {
  disabled?: boolean
}

export function UserProfileForm({ disabled = false }: UserProfileFormProps) {
  const [userProfile, setUserProfile] = useUserProfile()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserProfile((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
  }

  const handleSelectChange = (name: keyof typeof userProfile) => (value: string) => {
    setUserProfile((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
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
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            placeholder="e.g., 70"
            value={userProfile.weight || ""}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            name="height"
            type="number"
            placeholder="e.g., 175"
            value={userProfile.height || ""}
            onChange={handleChange}
            disabled={disabled}
          />
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
        <div className="space-y-2 sm:col-span-2">
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
              <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
              <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
              <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
              <SelectItem value="very_active">Extra active (very hard exercise/physical job)</SelectItem>
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
      </CardContent>
    </Card>
  )
}
