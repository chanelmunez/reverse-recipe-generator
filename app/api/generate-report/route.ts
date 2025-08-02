import { NextResponse } from "next/server"
import { getRecipeFromImage } from "@/lib/apis/vision"
import { analyzeRecipeWithSpoonacular } from "@/lib/apis/spoonacular"
import { analyzeFitnessGoals } from "@/lib/core/fitness-analyzer"
import type { UserProfile, ApiResponse, FoodIntelligenceReport, ErrorResponse } from "@/types"

export const maxDuration = 60

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

    // --- Step 1: Generate Recipe from Image using OpenAI Vision ---
    debugLog.push("Attempting to generate recipe from image with OpenAI Vision...")
    const visionResponse = await getRecipeFromImage(imageBuffer)
    if (!visionResponse?.recipe) {
      throw new Error("The AI model could not generate a recipe from the image.")
    }
    debugLog.push(`[OpenAI Vision] Generated recipe for: ${visionResponse.recipe.name}`)

    // --- Step 2: Analyze the AI-generated recipe with Spoonacular ---
    const { recipe, nutritionalProfile, costBreakdown } = await analyzeRecipeWithSpoonacular(
      visionResponse.recipe,
      debugLog,
    )

    // --- Step 3: Final Report Assembly ---
    const fitnessGoalAnalysis = analyzeFitnessGoals(userProfile, nutritionalProfile)

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
