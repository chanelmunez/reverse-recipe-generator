import { NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@/lib/ai/openai"
import { z } from "zod"

const IngredientHealthSchema = z.object({
  healthBenefits: z.string().describe("A concise 2-3 sentence summary of the key health benefits of this ingredient, including vitamins, minerals, or other nutritional properties."),
  nutritionalHighlights: z.array(z.string()).describe("A list of 3-4 key nutritional highlights (e.g., 'High in Vitamin C', 'Good source of fiber', 'Contains antioxidants')."),
  healthRating: z.enum(["excellent", "good", "moderate", "limited"]).describe("Overall health rating based on nutritional value and health benefits."),
})

export async function POST(request: NextRequest) {
  try {
    const { ingredient } = await request.json()

    if (!ingredient || typeof ingredient !== "string") {
      return NextResponse.json(
        { error: "Ingredient name is required" },
        { status: 400 }
      )
    }

    const systemPrompt = `
      You are a nutrition expert. Provide accurate, evidence-based health information about the given ingredient.
      Focus on:
      - Key vitamins, minerals, and nutrients
      - Health benefits supported by nutrition science
      - Why this ingredient can be considered healthy
      
      Keep the information concise, positive, and factual. Avoid medical claims or advice.
      The ingredient is: "${ingredient}"
    `

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: IngredientHealthSchema,
      prompt: systemPrompt,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("Error getting ingredient health info:", error)
    return NextResponse.json(
      { error: "Failed to get ingredient health information" },
      { status: 500 }
    )
  }
}
