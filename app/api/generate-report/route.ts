import { NextResponse } from "next/server"
import { getRecipeFromImage } from "@/lib/apis/vision"
import { analyzeRecipeWithSpoonacular } from "@/lib/apis/spoonacular"
import { getAIHealthAnalysis } from "@/lib/analysis/health-analyzer" // UPDATED IMPORT
import type { UserProfile, ApiResponse, FoodIntelligenceReport, ErrorResponse } from "@/types"

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

    debugLog.push("Attempting to generate recipe from image with OpenAI Vision...")
    const visionResponse = await getRecipeFromImage(imageBuffer)
    if (!visionResponse?.recipe) {
      throw new Error("The AI model could not generate a recipe from the image.")
    }
    debugLog.push(`[OpenAI Vision] Generated recipe for: ${visionResponse.recipe.name}`)

    const { recipe, nutritionalProfile, costBreakdown } = await analyzeRecipeWithSpoonacular(
      visionResponse.recipe,
      debugLog,
    )

    debugLog.push(`Normalizing profile from ${userProfile.unitSystem} to metric...`)
    const metricProfile = normalizeProfileToMetric(userProfile)

    // UPDATED: Call the new AI-powered health analyzer
    const fitnessGoalAnalysis = await getAIHealthAnalysis(metricProfile, nutritionalProfile, debugLog)

    const report: FoodIntelligenceReport = {
      id: crypto.randomUUID(),
      imageUrl,
      recipe,
      nutritionalProfile,
      costBreakdown,
      fitnessGoalAnalysis,
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
