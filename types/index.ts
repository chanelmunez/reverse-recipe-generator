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
  description: string
  ingredients: {
    name: string
    amount: string
  }[]
  steps: string[]
  mainIngredients: {
    name: string
    imageUrl: string
  }[]
}

// UPDATED: Added detailedNutrients
export interface DetailedNutrient {
  name: string
  amount: number
  unit: string
  percentOfDailyNeeds: number
}

export interface NutritionalProfile {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  detailedNutrients: DetailedNutrient[]
}

export interface CostBreakdown {
  totalCost: number
  perServing: number
  ingredientCosts: {
    name: string
    cost: number
  }[]
}

export interface HealthierOption {
  originalIngredient: string
  isHealthy: boolean
  suggestion: string
}

export interface PurchaseLocation {
  name: string
  description: string
  url: string
}

export interface PurchaseLocations {
  restaurants: PurchaseLocation[]
  stores: PurchaseLocation[]
}

// UPDATED: Added dailyGoals
export interface DailyGoals {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
}

export interface FitnessGoalAnalysis {
  healthScore: number
  mealSummary: string
  positivePoints: string[]
  areasForImprovement: string[]
  generalTips: string[]
  healthierOptions: HealthierOption[]
  dailyGoals: DailyGoals
}

export interface FoodIntelligenceReport {
  id: string
  imageUrl: string
  recipe: Recipe
  nutritionalProfile: NutritionalProfile
  costBreakdown: CostBreakdown
  fitnessGoalAnalysis: FitnessGoalAnalysis
  purchaseLocations: PurchaseLocations
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
