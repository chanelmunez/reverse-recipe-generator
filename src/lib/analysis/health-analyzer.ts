import { generateObject } from "ai"
import { getOpenAIProvider } from "@/lib/ai/openai"
import { z } from "zod"
import type { UserProfile, NutritionalProfile, FitnessGoalAnalysis } from "@/types"

const HealthAnalysisSchema = z.object({
  dailyGoals: z.object({
    calories: z.number().describe("The user's recommended total daily calorie intake."),
    protein: z.number().describe("The user's recommended daily protein intake in grams."),
    carbohydrates: z.number().describe("The user's recommended daily carbohydrate intake in grams."),
    fat: z.number().describe("The user's recommended daily fat intake in grams."),
  }),
  healthScore: z
    .number()
    .min(1)
    .max(100)
    .describe("A numerical score from 1-100 evaluating how well the meal aligns with the user's goals."),
  mealSummary: z.string().describe("A brief, one-sentence summary of the meal's suitability for the user."),
  positivePoints: z
    .array(z.string())
    .describe("A list of 2-3 bullet points highlighting the good aspects of the meal for the user's goals."),
  areasForImprovement: z
    .array(z.string())
    .describe("A list of 2-3 bullet points suggesting potential improvements or things to watch out for."),
  generalTips: z
    .array(z.string())
    .describe("A list of 2-3 general health and fitness tips relevant to the user's profile and goals."),
})

export async function getAIHealthAnalysis(
  profile: UserProfile,
  mealNutrition: NutritionalProfile,
  debugLog: string[],
): Promise<Omit<FitnessGoalAnalysis, "healthierOptions">> {
  debugLog.push("[AI Health Analysis] Starting analysis...")
  const openai = getOpenAIProvider()

  const systemPrompt = `
    You are an expert nutritionist and personal trainer. Your task is to provide a detailed health analysis of a meal and calculate the user's personalized daily dietary goals.

    The user's profile is:
    - Age: ${profile.age}
    - Sex: ${profile.sex}
    - Weight: ${profile.weight?.toFixed(1)} kg
    - Height: ${profile.height?.toFixed(1)} cm
    - Activity Level: ${profile.activityLevel}
    - Fitness Goal: ${profile.fitnessGoal}

    The meal's nutritional profile is:
    - Calories: ${mealNutrition.calories.toFixed(0)}
    - Protein: ${mealNutrition.protein.toFixed(1)}g
    - Carbohydrates: ${mealNutrition.carbohydrates.toFixed(1)}g
    - Fat: ${mealNutrition.fat.toFixed(1)}g

    First, calculate the user's recommended daily intake for calories, protein (g), carbohydrates (g), and fat (g) based on their profile, activity level, and fitness goal.
    Then, provide the full health analysis of the meal.

    You must respond ONLY with a JSON object that strictly matches the provided schema.
  `

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: HealthAnalysisSchema,
      prompt: systemPrompt,
    })
    debugLog.push("[AI Health Analysis] Analysis generated successfully.")
    return object
  } catch (error) {
    console.error("Error getting AI health analysis:", error)
    throw new Error("The AI model failed to generate a health analysis.")
  }
}
