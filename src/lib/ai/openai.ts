import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai"

let openai: OpenAIProvider | undefined

/**
 * Safely gets the OpenAI provider.
 * It uses a lazy-initialized singleton pattern and checks for the required API key.
 * @throws {Error} If the OPENAI_API_KEY environment variable is not set.
 * @returns {OpenAIProvider} The initialized OpenAI provider.
 */
export function getOpenAIProvider(): OpenAIProvider {
  if (openai) {
    return openai
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please add the OPENAI_API_KEY environment variable.")
  }

  openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return openai
}
