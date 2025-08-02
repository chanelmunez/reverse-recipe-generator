import { createGoogle, type GoogleProvider } from "@ai-sdk/google"

let google: GoogleProvider | undefined

/**
 * Safely gets the Google AI provider.
 * It uses a lazy-initialized singleton pattern and checks for the required API key.
 * @throws {Error} If the GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set.
 * @returns {GoogleProvider} The initialized Google provider.
 */
export function getGoogleProvider(): GoogleProvider {
  if (google) {
    return google
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "Google API key is not configured. Please add the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
    )
  }

  google = createGoogle({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  return google
}
