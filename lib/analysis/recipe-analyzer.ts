import { generateObject } from "ai"
import { openai } from "@/lib/ai/openai"
import { z } from "zod"
import type { AnalyzedRecipe } from "@/lib/apis/image-analyzer"
import type { NutritionalProfile, CostBreakdown } from "@/types"

// Schema for nutritional analysis only
const NutritionalAnalysisSchema = z.object({
  servings: z.number().describe("The number of servings this recipe makes."),
  nutritionalProfile: z.object({
    calories: z.number().describe("Total calories for the entire recipe."),
    protein: z.number().describe("Total protein in grams."),
    carbohydrates: z.number().describe("Total carbohydrates in grams."),
    fat: z.number().describe("Total fat in grams."),
    detailedNutrients: z
      .array(
        z.object({
          name: z.string().describe("The name of the nutrient (e.g., Vitamin C, Sodium)."),
          amount: z.number().describe("The amount of the nutrient."),
          unit: z.string().describe("The unit for the amount (e.g., 'mg', 'mcg')."),
          percentOfDailyNeeds: z
            .number()
            .describe("The percentage of the standard US Daily Value (%DV) for this nutrient."),
        }),
      )
      .describe("A list of at least 10 key micronutrients in the dish."),
  }),
})

// Schema for cost analysis only
const CostAnalysisSchema = z.object({
  costBreakdown: z.object({
    totalCost: z.number().describe("The total estimated cost of all ingredients in USD."),
    ingredientCosts: z
      .array(
        z.object({
          name: z.string().describe("The name of the ingredient."),
          cost: z.number().describe("The estimated cost of the specified amount of this ingredient in USD."),
        }),
      )
      .describe("A list of each ingredient and its estimated cost."),
  }),
})

type NutritionalAnalysis = z.infer<typeof NutritionalAnalysisSchema>
type CostAnalysis = z.infer<typeof CostAnalysisSchema>

/**
 * Analyzes a recipe's nutritional content using OpenAI.
 * @param recipe - The recipe object from the vision model.
 * @param debugLog - An array to push debug messages to.
 * @returns A promise that resolves to the nutritional profile and servings.
 */
export async function analyzeNutritionalContent(
  recipe: AnalyzedRecipe,
  debugLog: string[],
): Promise<{ nutritionalProfile: NutritionalProfile; servings: number }> {
  debugLog.push("[Nutritional Analysis] Starting nutritional analysis...")

  // Ensure ingredient quantities are properly formatted
  const ingredientList = recipe.ingredients
    .map((ing) => {
      const amount = ing.amount?.trim() || "1 serving"
      const name = ing.name?.trim() || "unknown ingredient"
      return `${amount} ${name}`
    })
    .join(", ")

  if (!ingredientList || ingredientList.trim() === "") {
    throw new Error("No ingredients found in recipe for nutritional analysis")
  }

  const systemPrompt = `
You are an expert nutritionist. Analyze the nutritional content of this recipe.

Recipe: ${recipe.name}
Ingredients: ${ingredientList}

Provide:
1. Total calories, protein, carbohydrates, and fat for the entire recipe
2. At least 10 key micronutrients with amounts, units, and %DV
3. Estimated number of servings

Respond ONLY with valid JSON matching the schema.
`

  try {
    const { object: analysis }: { object: NutritionalAnalysis } = await generateObject({
      model: openai("gpt-4o"),
      mode: "json",
      schema: NutritionalAnalysisSchema,
      prompt: systemPrompt,
    })

    debugLog.push("[Nutritional Analysis] Analysis generated successfully.")
    return {
      nutritionalProfile: analysis.nutritionalProfile,
      servings: analysis.servings,
    }
  } catch (error) {
    console.error("Error getting nutritional analysis:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred during nutritional analysis."
    debugLog.push(`[Nutritional Analysis] Failed: ${message}`)
    throw new Error("The AI model failed to generate nutritional analysis.")
  }
}

/**
 * Analyzes a recipe's cost breakdown using OpenAI.
 * @param recipe - The recipe object from the vision model.
 * @param servings - The number of servings (from nutritional analysis).
 * @param debugLog - An array to push debug messages to.
 * @returns A promise that resolves to the cost breakdown.
 */
export async function analyzeCostBreakdown(
  recipe: AnalyzedRecipe,
  servings: number,
  debugLog: string[],
): Promise<CostBreakdown> {
  debugLog.push("[Cost Analysis] Starting cost analysis...")

  // Ensure ingredient quantities are properly formatted
  const ingredientList = recipe.ingredients
    .map((ing) => {
      const amount = ing.amount?.trim() || "1 serving"
      const name = ing.name?.trim() || "unknown ingredient"
      return `${amount} ${name}`
    })
    .join(", ")

  if (!ingredientList || ingredientList.trim() === "") {
    throw new Error("No ingredients found in recipe for cost analysis")
  }

  const systemPrompt = `
You are an expert in food pricing. Estimate the cost of ingredients for this recipe.

Recipe: ${recipe.name}
Ingredients: ${ingredientList}
Servings: ${servings}

Provide:
1. Cost estimate for each ingredient (use US national average prices)
2. Total cost of all ingredients

Use realistic grocery store prices. Respond ONLY with valid JSON matching the schema.
`

  try {
    const { object: analysis }: { object: CostAnalysis } = await generateObject({
      model: openai("gpt-4o"),
      mode: "json",
      schema: CostAnalysisSchema,
      prompt: systemPrompt,
    })

    debugLog.push("[Cost Analysis] Analysis generated successfully.")

    const perServingCost = servings > 0 ? analysis.costBreakdown.totalCost / servings : analysis.costBreakdown.totalCost

    return {
      ...analysis.costBreakdown,
      perServing: perServingCost,
    }
  } catch (error) {
    console.error("Error getting cost analysis:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred during cost analysis."
    debugLog.push(`[Cost Analysis] Failed: ${message}`)
    throw new Error("The AI model failed to generate cost analysis.")
  }
}

/**
 * Analyzes a recipe for both nutritional content and cost using OpenAI (runs in parallel).
 * @param recipe - The recipe object from the vision model.
 * @param debugLog - An array to push debug messages to.
 * @returns A promise that resolves to the nutritional profile and cost breakdown.
 */
export async function analyzeRecipeWithAI(
  recipe: AnalyzedRecipe,
  debugLog: string[],
): Promise<{ nutritionalProfile: NutritionalProfile; costBreakdown: CostBreakdown }> {
  debugLog.push("[AI Recipe Analysis] Starting parallel nutritional and cost analysis...")

  try {
    // Run nutritional analysis first to get servings count
    const { nutritionalProfile, servings } = await analyzeNutritionalContent(recipe, debugLog)
    
    // Then run cost analysis with the servings information
    const costBreakdown = await analyzeCostBreakdown(recipe, servings, debugLog)

    debugLog.push("[AI Recipe Analysis] Both analyses completed successfully.")
    return {
      nutritionalProfile,
      costBreakdown,
    }
  } catch (error) {
    console.error("Error in recipe analysis:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred during recipe analysis."
    debugLog.push(`[AI Recipe Analysis] Failed: ${message}`)
    throw error // Re-throw the original error for better debugging
  }
}
