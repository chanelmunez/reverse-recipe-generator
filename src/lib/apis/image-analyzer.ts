import { generateObject } from "ai"
import { getGoogleProvider } from "@/lib/ai/google"
import { z } from "zod"

const RecipeSchema = z.object({
  name: z.string().describe("The name of the dish."),
  mainIngredients: z
    .array(z.string())
    .describe("A list of the 4 to 6 most visually prominent or important ingredients in the dish."),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe("The common name of the ingredient."),
        amount: z
          .string()
          .describe("An estimated quantity of the ingredient for a single serving (e.g., '1 cup', '150g')."),
      }),
    )
    .describe("A list of all ingredients with their estimated amounts for a single serving."),
  steps: z.array(z.string()).describe("The steps to prepare the recipe."),
})

export type AnalyzedRecipe = z.infer<typeof RecipeSchema>

export async function analyzeImageWithGemini(imageBuffer: Buffer, mimeType: string): Promise<AnalyzedRecipe> {
  try {
    const google = getGoogleProvider()

    const { object } = await generateObject({
      model: google("models/gemini-1.5-flash-latest"),
      schema: RecipeSchema,
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
              type: "text",
              text: "Analyze the attached image and provide a recipe and ingredient list.",
            },
            {
              type: "image",
              image: imageBuffer,
              mimeType: mimeType,
            },
          ],
        },
      ],
    })

    return object
  } catch (error) {
    console.error("Error in analyzeImageWithGemini:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred during Gemini analysis."
    throw new Error(message)
  }
}
