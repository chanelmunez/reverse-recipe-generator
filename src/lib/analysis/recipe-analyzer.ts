import { generateObject } from "ai"
import { getOpenAIProvider } from "@/lib/ai/openai"
import { z } from "zod"
import type { AnalyzedRecipe } from "@/lib/apis/image-analyzer"
import type { NutritionalProfile, CostBreakdown } from "@/types"

const RecipeAnalysisSchema = z.object({
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

type RecipeAnalysis = z.infer<typeof RecipeAnalysisSchema>

export async function analyzeRecipeWithAI(
  recipe: AnalyzedRecipe,
  debugLog: string[],
): Promise<{ nutritionalProfile: NutritionalProfile; costBreakdown: CostBreakdown }> {
  debugLog.push("[AI Recipe Analysis] Starting nutritional and cost analysis...")
  const openai = getOpenAIProvider()

  const ingredientList = recipe.ingredients.map((ing) => `${ing.amount} ${ing.name}`).join(", ")

  const systemPrompt = `
You are an expert food analyst. Your task is to provide a detailed nutritional and cost analysis for a given recipe.

The recipe is:
- Name: ${recipe.name}
- Ingredients: ${ingredientList}

Your analysis must include:
1.  **Nutritional Profile**:
  - Calculate the total calories, protein, carbohydrates, and fat for the entire dish.
  - Provide a list of at least 10 key micronutrients (e.g., Vitamin C, Iron, Sodium, Potassium, Calcium) present in the dish. For each, include its amount, unit, and the percentage of the standard US Daily Value (%DV).
2.  **Cost Breakdown**:
  - Estimate the cost for the specified amount of EACH ingredient. Use US national average prices in USD.
  - Calculate the total cost of the recipe by summing the individual ingredient costs.
3.  **Servings**: Estimate the number of servings the recipe provides.

You must respond ONLY with a JSON object that strictly matches the provided schema.
`

  try {
    const { object: analysis }: { object: RecipeAnalysis } = await generateObject({
      model: openai("gpt-4o"),
      mode: "json",
      schema: RecipeAnalysisSchema,
      prompt: systemPrompt,
    })

    debugLog.push("[AI Recipe Analysis] Analysis generated successfully.")

    const perServingCost =
      analysis.servings > 0 ? analysis.costBreakdown.totalCost / analysis.servings : analysis.costBreakdown.totalCost

    const finalCostBreakdown: CostBreakdown = {
      ...analysis.costBreakdown,
      perServing: perServingCost,
    }

    return {
      nutritionalProfile: analysis.nutritionalProfile,
      costBreakdown: finalCostBreakdown,
    }
  } catch (error) {
    console.error("Error getting AI recipe analysis:", error)
    debugLog.push(`[AI Recipe Analysis] Failed to generate analysis: ${error}`)
    throw new Error("The AI model failed to generate recipe analysis.")
  }
}
