import type { Recipe, NutritionalProfile, CostBreakdown } from "../../types"

// This is a mock implementation of the Spoonacular API client.

interface FoodDetails {
  recipe: Recipe
  nutritionalProfile: NutritionalProfile
  costBreakdown: CostBreakdown
}

/**
 * Mocks getting recipe, nutrition, and cost data for a list of ingredients.
 * @param {string[]} ingredients - A list of ingredients.
 * @returns {Promise<FoodDetails>} A promise that resolves to mock food details.
 */
export async function getFoodDetails(ingredients: string[]): Promise<FoodDetails> {
  console.log(`Mock: Getting details for ingredients: ${ingredients.join(", ")}...`)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock data based on the ingredients from fatsecret.ts
  const mockData: FoodDetails = {
    recipe: {
      name: "Simple Grilled Chicken with Quinoa & Broccoli",
      ingredients: [
        { name: "Chicken Breast", amount: "150g" },
        { name: "Broccoli", amount: "1 cup" },
        { name: "Quinoa, cooked", amount: "1 cup" },
        { name: "Olive Oil", amount: "1 tbsp" },
        { name: "Salt and Pepper", amount: "to taste" },
      ],
      steps: [
        "Preheat grill to medium-high.",
        "Season chicken breast with salt, pepper, and toss with olive oil.",
        "Grill chicken for 6-8 minutes per side, until cooked through.",
        "Steam or roast broccoli until tender-crisp.",
        "Serve grilled chicken alongside cooked quinoa and broccoli.",
      ],
    },
    nutritionalProfile: {
      calories: 550,
      protein: 45,
      carbohydrates: 40,
      fat: 20,
    },
    costBreakdown: {
      totalCost: 7.5,
      perServing: 7.5,
    },
  }

  return Promise.resolve(mockData)
}
