import { generateObject } from "ai"
import { openai } from "@/lib/ai/openai"
import { z } from "zod"
import type { PurchaseLocations } from "@/types"

const PurchaseLocationsSchema = z.object({
  restaurants: z
    .array(
      z.object({
        name: z.string().describe("The name of the restaurant chain."),
        description: z.string().describe("A brief description of why this restaurant is a good suggestion."),
        url: z.string().url().describe("The most specific URL possible: direct dish link > category/section link > menu page > homepage as fallback."),
      }),
    )
    .describe("A list of 2-3 well-known restaurant chains that might sell this dish."),
  stores: z
    .array(
      z.object({
        name: z.string().describe("The name of the grocery store chain."),
        description: z.string().describe("A brief description of why this store is a good suggestion for ingredients."),
        url: z.string().url().describe("A search URL with parameters for the dish ingredients, or generic store URL as fallback."),
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

  const systemPrompt = `
    You are a food and retail expert. Your task is to suggest where a user can buy a specific dish or its ingredients.
    The dish is: "${dishName}".

    IMPORTANT URL REQUIREMENTS:
    
    For RESTAURANTS:
    - Try to provide the most specific URL possible using this hierarchy:
      1. BEST: Direct link to the specific dish if available (e.g., mcdonalds.com/us/en-us/product/big-mac.html)
      2. GOOD: Link to the menu category/section for that dish type (e.g., chipotle.com/order/bowls)
      3. OK: Link to the general menu page (e.g., restaurant.com/menu)
      4. FALLBACK: Homepage only if no menu is available
    - Use real, working URLs for major chains like McDonald's, Chipotle, Taco Bell, etc.
    
    For GROCERY STORES:
    - Try to provide search URLs with parameters for key ingredients:
      * Target.com: https://www.target.com/s?searchTerm=[INGREDIENT]
      * Walmart.com: https://www.walmart.com/search?q=[INGREDIENT]
      * Kroger.com: https://www.kroger.com/search?query=[INGREDIENT]
    - Use the main ingredient or dish name as the search term
    - If search URLs aren't feasible, use the store's grocery section URL
    - Fallback to homepage only if necessary
    
    Please provide:
    1. A list of 2-3 well-known restaurant chains in the USA where a similar dish might be found.
    2. A list of 2-3 major grocery store chains where ingredients for this dish are available.

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
