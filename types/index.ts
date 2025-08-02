export type Sex = "male" | "female"
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"
export type FitnessGoal = "weight_loss" | "maintenance" | "muscle_gain"
export type UnitSystem = "metric" | "imperial"

export interface UserProfile {
  age: number | null
  weight: number | null
  height: number | null
  heightInches?: number | null
  sex: Sex | ""
  activityLevel: ActivityLevel | ""
  fitnessGoal: FitnessGoal | ""
  unitSystem: UnitSystem
}

export interface Recipe {
  name: string
  ingredients: {
    name: string
    amount: string
  }[]
  steps: string[]
}

export interface NutritionalProfile {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
}

export interface CostBreakdown {
  totalCost: number
  perServing: number
}

// NEW: Updated to hold the AI-generated health analysis
export interface FitnessGoalAnalysis {
  healthScore: number
  mealSummary: string
  positivePoints: string[]
  areasForImprovement: string[]
  generalTips: string[]
}

export interface FoodIntelligenceReport {
  id: string
  imageUrl: string
  recipe: Recipe
  nutritionalProfile: NutritionalProfile
  costBreakdown: CostBreakdown
  fitnessGoalAnalysis: FitnessGoalAnalysis
  debugInfo?: string[]
}

export type SuccessResponse = {
  status: "success"
  data: FoodIntelligenceReport
}

export type ErrorResponse = {
  status: "error"
  message: string
  debugInfo?: string[]
}

export type ApiResponse = SuccessResponse | ErrorResponse
