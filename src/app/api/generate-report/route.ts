import { NextResponse } from "next/server"
import { recognizeIngredients } from "../../../lib/apis/fatsecret"
import { getFoodDetails } from "../../../lib/apis/spoonacular"
import { analyzeFitnessGoals } from "../../../lib/core/fitness-analyzer"
import type { UserProfile, ApiResponse } from "../../../types"

// Helper to read file buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const userProfileString = formData.get("userProfile") as string | null

    if (!imageFile || !userProfileString) {
      return NextResponse.json({ status: "error", message: "Missing image or user profile." }, { status: 400 })
    }

    const userProfile: UserProfile = JSON.parse(userProfileString)

    // In a real app, you'd pass the image buffer to the API
    // const imageBuffer = await fileToBuffer(imageFile);
    // For now, we mock this process.
    const { ingredients } = await recognizeIngredients(imageFile)
    const { recipe, nutritionalProfile, costBreakdown } = await getFoodDetails(ingredients)
    const fitnessGoalAnalysis = analyzeFitnessGoals(userProfile, nutritionalProfile)

    // Create a data URL to display the uploaded image on the report page
    const imageBuffer = await fileToBuffer(imageFile)
    const imageBase64 = imageBuffer.toString("base64")
    const imageMimeType = imageFile.type
    const imageUrl = `data:${imageMimeType};base64,${imageBase64}`

    const report = {
      id: crypto.randomUUID(),
      imageUrl,
      recipe,
      nutritionalProfile,
      costBreakdown,
      fitnessGoalAnalysis,
    }

    const response: ApiResponse = { status: "success", data: report }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating report:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return NextResponse.json({ status: "error", message }, { status: 500 })
  }
}
