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
      // FIX: Updated the system prompt to be more explicit about the JSON output format
      // to improve the reliability of the AI's response.
      system:
        "You are an expert food analyst. Your task is to analyze the provided image of a meal and generate a recipe for it. You must respond ONLY with a JSON object that strictly matches the provided schema. The JSON object should contain a recipe with a name, a list of ingredients (each with a name and an amount), and the preparation steps. If you cannot identify a meal in the image, you must still provide a valid JSON object with empty strings and arrays for the fields.",
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
    // Re-throw the original error to be caught by the API route handler
    throw error
  }
}
