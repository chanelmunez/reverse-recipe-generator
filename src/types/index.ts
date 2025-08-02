export type Sex = "male" | "female"
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"
export type FitnessGoal = "weight_loss" | "maintenance" | "muscle_gain"

export interface UserProfile {
  age: number | null
  weight: number | null // in kg
  height: number | null // in cm
  sex: Sex | ""
  activityLevel: ActivityLevel | ""
  fitnessGoal: FitnessGoal | ""
}

export interface Recipe {
  name: string
  ingredients: { name: string; amount: string }[]
  steps: string[]
}

export interface NutritionalProfile {
  calories: number
  protein: number // in grams
  carbohydrates: number // in grams
  fat: number // in grams
}

export interface CostBreakdown {
  totalCost: number // in USD
  perServing: number
}

export interface FitnessGoalAnalysis {
  tdee: number // Total Daily Energy Expenditure
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
}

export type SuccessResponse = {
  status: "success"
  data: FoodIntelligenceReport
}

export type ErrorResponse = {
  status: "error"
  message: string
}

export type ApiResponse = SuccessResponse | ErrorResponse
