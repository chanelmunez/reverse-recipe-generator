import { generateObject } from "ai"
import { getOpenAIProvider } from "@/lib/ai/openai"
import { z } from "zod"
import type { UserProfile, Recipe, HealthierOption } from "@/types"

const HealthierOptionsSchema = z.object({
  suggestions: z.array(
    z.object({
      originalIngredient: z.string().describe("The ingredient being evaluated."),
      isHealthy: z
        .boolean()
        .describe("True if the ingredient is already a good choice for the user's goal, otherwise false."),
      suggestion: z
        .string()
        .describe(
          "The suggested healthier alternative and a brief reason why. If isHealthy is true, this can be a short confirmation like 'This is a great choice!'.",
        ),
    }),
  ),
})

export async function getHealthierOptions(
  profile: UserProfile,
  ingredients: Recipe["ingredients"],
  debugLog: string[],
): Promise<HealthierOption[]> {
  debugLog.push("[AI Ingredient Analysis] Starting analysis for healthier options...")
  const openai = getOpenAIProvider()

  const ingredientList = ingredients.map((ing) => ing.name).join(", ")

  const systemPrompt = `
    You are a nutritionist providing advice on healthier ingredient substitutions.
    The user's profile is:
    - Age: ${profile.age}
    - Sex: ${profile.sex}
    - Fitness Goal: ${profile.fitnessGoal}

    The ingredients in their meal are: ${ingredientList}.

    Your task is to evaluate each ingredient based on the user's fitness goal.
    - For 'weight_loss', prioritize lower-calorie, high-fiber, and high-protein options.
    - For 'muscle_gain', prioritize protein-dense and nutrient-rich options.
    - For 'maintenance', prioritize balanced, whole-food options.

    For each ingredient, determine if it's a good choice. If it is not optimal, suggest one or two healthier alternatives and briefly explain why. If it is already a good choice, confirm that.
    You must respond ONLY with a JSON object that strictly matches the provided schema.
  `

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: HealthierOptionsSchema,
      prompt: systemPrompt,
    })
    debugLog.push(`[AI Ingredient Analysis] Generated ${object.suggestions.length} suggestions.`)
    return object.suggestions
  } catch (error) {
    console.error("Error getting healthier ingredient options:", error)
    debugLog.push("[AI Ingredient Analysis] Failed to generate suggestions.")
    return []
  }
}
