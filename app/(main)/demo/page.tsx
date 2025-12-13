"use client"

import { ReportDisplay } from "@/components/features/report-display"
import type { FoodIntelligenceReport } from "@/types"

// Mock data for UI development - Greek Salmon Bowl
const mockReport: FoodIntelligenceReport = {
  id: "demo-123",
  imageUrl: "/food/greek-salmon-bowl-f681500cbe054bb1adb607ff55094075.jpeg",
  recipe: {
    name: "Greek Salmon Bowl",
    description: "A nutritious Mediterranean-inspired bowl featuring grilled salmon, quinoa, fresh vegetables, and feta cheese.",
    ingredients: [
      { name: "Salmon fillet", amount: "6 oz" },
      { name: "Quinoa", amount: "1 cup cooked" },
      { name: "Sugar snap peas", amount: "1/2 cup" },
      { name: "Cherry tomatoes", amount: "1/2 cup" },
      { name: "Kalamata olives", amount: "2 tbsp" },
      { name: "Feta cheese", amount: "2 oz" },
      { name: "Fresh oregano", amount: "1 tbsp" },
      { name: "Olive oil", amount: "1 tbsp" },
      { name: "Lemon juice", amount: "1 tbsp" },
    ],
    steps: [
      "Cook quinoa according to package directions and let cool slightly.",
      "Season salmon with salt, pepper, and oregano. Grill for 4-5 minutes per side.",
      "Blanch sugar snap peas in boiling water for 2 minutes, then ice bath.",
      "Halve the cherry tomatoes and slice the olives.",
      "Arrange quinoa in bowl, top with flaked salmon.",
      "Add snap peas, tomatoes, olives, and crumbled feta.",
      "Drizzle with olive oil and lemon juice. Garnish with fresh oregano.",
    ],
    mainIngredients: [
      { name: "Salmon", imageUrl: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=200" },
      { name: "Quinoa", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200" },
      { name: "Feta", imageUrl: "https://images.unsplash.com/photo-1626957341926-98752fc2ba90?w=200" },
      { name: "Tomatoes", imageUrl: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=200" },
    ],
  },
  nutritionalProfile: {
    calories: 520,
    protein: 42,
    carbohydrates: 35,
    fat: 24,
    detailedNutrients: [
      { name: "Fiber", amount: 6, unit: "g", percentOfDailyNeeds: 24 },
      { name: "Omega-3", amount: 2.5, unit: "g", percentOfDailyNeeds: 156 },
      { name: "Vitamin D", amount: 15, unit: "mcg", percentOfDailyNeeds: 75 },
      { name: "Calcium", amount: 180, unit: "mg", percentOfDailyNeeds: 18 },
      { name: "Iron", amount: 3.2, unit: "mg", percentOfDailyNeeds: 18 },
      { name: "Potassium", amount: 820, unit: "mg", percentOfDailyNeeds: 17 },
    ],
  },
  costBreakdown: {
    totalCost: 12.50,
    perServing: 12.50,
    ingredientCosts: [
      { name: "Salmon fillet", cost: 7.00 },
      { name: "Quinoa", cost: 1.50 },
      { name: "Vegetables", cost: 2.00 },
      { name: "Feta cheese", cost: 1.50 },
      { name: "Other", cost: 0.50 },
    ],
  },
  fitnessGoalAnalysis: {
    healthScore: 88,
    mealSummary: "Excellent high-protein meal with heart-healthy fats and complex carbs. Great for muscle building and sustained energy.",
    positivePoints: [
      "High in omega-3 fatty acids for heart and brain health",
      "Complete protein source with all essential amino acids",
      "Rich in fiber from quinoa and vegetables",
      "Good balance of macronutrients",
    ],
    areasForImprovement: [
      "Sodium content from feta and olives may be high",
      "Consider adding more leafy greens for additional vitamins",
    ],
    generalTips: [
      "Pair with water or unsweetened tea to stay hydrated",
      "This meal works great for post-workout recovery",
      "Prep quinoa in batches for quick weekday meals",
    ],
    healthierOptions: [
      { originalIngredient: "Feta cheese", isHealthy: true, suggestion: "Already a good choice - lower fat than most cheeses" },
      { originalIngredient: "Kalamata olives", isHealthy: false, suggestion: "Use sparingly due to sodium; try capers for similar flavor" },
    ],
    dailyGoals: {
      calories: 2000,
      protein: 150,
      carbohydrates: 250,
      fat: 65,
    },
  },
  purchaseLocations: {
    restaurants: [
      { name: "Sweetgreen", description: "Build-your-own Mediterranean bowls", url: "https://sweetgreen.com" },
      { name: "CAVA", description: "Greek-inspired grain bowls", url: "https://cava.com" },
    ],
    stores: [
      { name: "Whole Foods", description: "Fresh salmon and organic quinoa", url: "https://wholefoodsmarket.com" },
      { name: "Trader Joe's", description: "Pre-marinated salmon and feta", url: "https://traderjoes.com" },
    ],
  },
}

export default function DemoPage() {
  return <ReportDisplay report={mockReport} />
}
