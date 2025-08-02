import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { PurchaseLocations } from "@/types"

// UPDATED: The schema now includes a URL for each location.
const PurchaseLocationsSchema = z.object({
  restaurants: z
    .array(
      z.object({
        name: z.string().describe("The name of the restaurant chain."),
        description: z.string().describe("A brief description of why this restaurant is a good suggestion."),
        url: z.string().url().describe("A direct URL to the restaurant's menu or homepage."),
      }),
    )
    .describe("A list of 2-3 well-known restaurant chains that might sell this dish."),
  stores: z
    .array(
      z.object({
        name: z.string().describe("The name of the grocery store chain."),
        description: z.string().describe("A brief description of why this store is a good suggestion for ingredients."),
        url: z.string().url().describe("A direct URL to the store's website."),
      }),
    )
    .describe("A list of 2-3 national grocery stores where ingredients for this dish can be bought."),
})

/**
 * Generates purchase location suggestions using OpenAI.
 * @param dishName - The name of the dish.
 * @param debugLog - An array to push debug messages to.
 * @returns A list of suggested restaurants and stores.
 */
export async function getPurchaseLocations(dishName: string, debugLog: string[]): Promise<PurchaseLocations> {
  debugLog.push(`[Purchase Analyzer] Getting purchase locations for "${dishName}"...`)

  // UPDATED: The prompt now explicitly asks for URLs.
  const systemPrompt = `
    You are a food and retail expert. Your task is to suggest where a user can buy a specific dish or its ingredients.
    The dish is: "${dishName}".

    Please provide:
    1. A list of 2-3 well-known, national or large regional restaurant chains in the USA where a similar dish might be found. For each, provide its name, a brief description, and a direct URL to its menu or homepage.
    2. A list of 2-3 major national grocery store chains in the USA where the primary ingredients for this dish are commonly available. For each, provide its name, a brief description, and a direct URL to its website.

    You must respond ONLY with a JSON object that strictly matches the provided schema.
  `

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: PurchaseLocationsSchema,
      prompt: systemPrompt,
    })
    debugLog.push("[Purchase Analyzer] Analysis successful.")
    return object
  } catch (error) {
    console.error("Error getting purchase locations:", error)
    debugLog.push("[Purchase Analyzer] Failed to generate suggestions.")
    // Return empty object on failure to avoid crashing the report
    return { restaurants: [], stores: [] }
  }
}
