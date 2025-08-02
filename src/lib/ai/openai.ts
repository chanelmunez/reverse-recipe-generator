import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai"

let openai: OpenAIProvider | undefined

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
