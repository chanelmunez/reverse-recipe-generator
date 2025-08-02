import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Define a recipe type for this module's purpose
export type VisionRecipe = z.infer<typeof RecipeSchema>

// The schema is now a flat object, which is more reliable for the AI to generate.
const RecipeSchema = z.object({
  name: z.string().describe("The name of the dish."),
  mainIngredients: z
    .array(z.string())
    .describe("A list of the 4 to 6 most visually prominent or important ingredients in the dish."),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe("The common name of the ingredient."),
        amount: z.string().describe("The quantity of the ingredient in common units (e.g., '1 cup', '150g')."),
      }),
    )
    .describe("A list of all ingredients with their amounts."),
  steps: z.array(z.string()).describe("The steps to prepare the recipe."),
})

/**
 * Analyzes an image of a meal and returns a structured recipe object.
 * @param {Buffer} imageBuffer - The buffer of the image to analyze.
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns {Promise<VisionRecipe>} A promise that resolves to the recipe object.
 */
export async function getRecipeFromImage(imageBuffer: Buffer, mimeType: string): Promise<VisionRecipe> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("The OPENAI_API_KEY environment variable is not set.")
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o", { apiKey: process.env.OPENAI_API_KEY }),
      schema: RecipeSchema,
      // Force the model to use JSON mode for reliable structured output.
      mode: "json",
      system: `
        You are a food analysis API. Your only function is to analyze an image of a meal and return a JSON object.
        Do not include any introductory text, markdown formatting, or explanations.
        Your response must be a single, valid JSON object and nothing else.
        The JSON object must conform to the provided schema.
        If you cannot identify the meal, return a JSON object with empty strings and arrays for all fields.
      `,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              // Pass the raw buffer and mimeType directly for robust handling.
              image: imageBuffer,
              mimeType: mimeType,
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
