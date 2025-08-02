import { NextResponse } from "next/server"
import { getRecipeFromImage } from "@/lib/apis/vision"
import { analyzeRecipeWithAI } from "@/lib/analysis/recipe-analyzer"
import { searchForImage } from "@/lib/apis/google-image-search" // UPDATED
import { getAIHealthAnalysis } from "@/lib/analysis/health-analyzer"
import { getHealthierOptions } from "@/lib/analysis/ingredient-analyzer"
import { getPurchaseLocations } from "@/lib/analysis/purchase-analyzer"
import type { UserProfile, ApiResponse, FoodIntelligenceReport, ErrorResponse, Recipe } from "@/types"

export const maxDuration = 60

function normalizeProfileToMetric(profile: UserProfile): UserProfile {
  if (profile.unitSystem === "imperial") {
    const weightInLbs = profile.weight || 0
    const heightInFeet = profile.height || 0
    const heightInInches = profile.heightInches || 0
    const LBS_TO_KG = 0.453592
    const INCHES_TO_CM = 2.54
    const weightInKg = weightInLbs * LBS_TO_KG
    const totalInches = heightInFeet * 12 + heightInInches
    const heightInCm = totalInches * INCHES_TO_CM
    return { ...profile, weight: weightInKg, height: heightInCm, heightInches: 0 }
  }
  return profile
}

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(request: Request) {
  const debugLog: string[] = []

  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const userProfileString = formData.get("userProfile") as string | null

    if (!imageFile || !userProfileString) {
      return NextResponse.json({ status: "error", message: "Missing image or user profile." }, { status: 400 })
    }

    const userProfile: UserProfile = JSON.parse(userProfileString)
    const imageBuffer = await fileToBuffer(imageFile)
    const imageUrl = `data:${imageFile.type};base64,${imageBuffer.toString("base64")}`

    debugLog.push("Step 1: Generating recipe from image with OpenAI Vision...")
    // UPDATED: Passing the image's MIME type to the vision API
    const recipeFromVision = await getRecipeFromImage(imageBuffer, imageFile.type)
    if (!recipeFromVision?.name) {
      throw new Error("The AI model could not generate a recipe from the image.")
    }
    debugLog.push(`[OpenAI Vision] Identified main ingredients: ${recipeFromVision.mainIngredients.join(", ")}`)

    debugLog.push("Step 2: Fetching ingredient images and analyzing recipe with AI in parallel...")
    const [aiAnalysis, mainIngredientImages] = await Promise.all([
      analyzeRecipeWithAI(recipeFromVision, debugLog),
      // UPDATED: Reverted to using Google Image Search
      Promise.all(
        recipeFromVision.mainIngredients.map(async (name) => ({
          name,
          imageUrl: await searchForImage(name, debugLog),
        })),
      ),
    ])
    debugLog.push("Ingredient image search and AI recipe analysis complete.")

    const { nutritionalProfile, costBreakdown } = aiAnalysis

    const recipe: Recipe = {
      name: recipeFromVision.name,
      steps: recipeFromVision.steps,
      ingredients: recipeFromVision.ingredients,
      mainIngredients: mainIngredientImages,
    }

    const metricProfile = normalizeProfileToMetric(userProfile)

    debugLog.push("Step 3: Running final health, ingredient, and purchase analyses in parallel...")
    const [healthAnalysis, healthierOptions, purchaseLocations] = await Promise.all([
      getAIHealthAnalysis(metricProfile, nutritionalProfile, debugLog),
      getHealthierOptions(metricProfile, recipe.ingredients, debugLog),
      getPurchaseLocations(recipe.name, debugLog),
    ])
    debugLog.push("All parallel analyses completed.")

    const fitnessGoalAnalysis = { ...healthAnalysis, healthierOptions }

    const report: FoodIntelligenceReport = {
      id: crypto.randomUUID(),
      imageUrl,
      recipe,
      nutritionalProfile,
      costBreakdown,
      fitnessGoalAnalysis,
      purchaseLocations,
      debugInfo: debugLog,
    }

    debugLog.push("Report generation successful.")
    return NextResponse.json({ status: "success", data: report } as ApiResponse)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "An unknown server error occurred."
    debugLog.push(`A critical error occurred: ${errorMsg}`)
    return NextResponse.json({ status: "error", message: errorMsg, debugInfo: debugLog } as ErrorResponse, {
      status: 500,
    })
  }
}
