import { createOpenAI } from "@ai-sdk/openai"

// Create a single, configured instance of the OpenAI provider.
// By calling createOpenAI() without arguments, we let the SDK automatically
// and safely find the OPENAI_API_KEY from the environment variables.
// This is the most robust method for Vercel environments.
export const openai = createOpenAI()
