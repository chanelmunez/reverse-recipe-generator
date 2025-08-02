export type Sex = "male" | "female"
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"
export type FitnessGoal = "weight_loss" | "maintenance" | "muscle_gain"

export interface UserProfile {
  age: number | null
  weight: number | null
  height: number | null
  sex: Sex | ""
  activityLevel: ActivityLevel | ""
  fitnessGoal: FitnessGoal | ""
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

export interface FitnessGoalAnalysis {
  tdee: number
  goalCalories: number
  feedback: string
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
