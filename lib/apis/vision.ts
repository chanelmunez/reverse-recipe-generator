import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { Recipe } from "@/types"

// Define the schema for the AI's response to generate a full recipe
const RecipeSchema = z.object({
  recipe: z.object({
    name: z.string().describe("The name of the dish."),
    ingredients: z
      .array(
        z.object({
          name: z.string().describe("The common name of the ingredient."),
          amount: z.string().describe("The quantity of the ingredient in common units (e.g., '1 cup', '150g')."),
        }),
      )
      .describe("A list of ingredients with their amounts."),
    steps: z.array(z.string()).describe("The steps to prepare the recipe."),
  }),
})

/**
 * Analyzes an image of a meal and returns a structured recipe object.
 * @param {Buffer} imageBuffer - The buffer of the image to analyze.
 * @returns {Promise<{recipe: Recipe}>} A promise that resolves to the recipe object.
 */
export async function getRecipeFromImage(imageBuffer: Buffer): Promise<{ recipe: Recipe }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("The OPENAI_API_KEY environment variable is not set.")
  }

  try {
    const imageAsBase64 = imageBuffer.toString("base64")

    const { object } = await generateObject({
      model: openai("gpt-4o", { apiKey: process.env.OPENAI_API_KEY }),
      schema: RecipeSchema,
      system:
        "You are a world-class chef and food analyst. Analyze the image of a meal provided by the user. Your task is to return a likely recipe name, a list of ingredients with estimated amounts, and the preparation steps. Be concise and clear.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageAsBase64,
            },
          ],
        },
      ],
    })

    return object
  } catch (error) {
    console.error("Error getting recipe from image:", error)
    throw error
  }
}
