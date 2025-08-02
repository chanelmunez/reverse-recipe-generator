const GOOGLE_API_KEY = process.env.GOOGLE_VISION_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

const PLACEHOLDER_IMAGE = "/placeholder.svg"

export async function searchForImage(query: string, debugLog: string[]): Promise<string> {
  debugLog.push(`[Google Image Search] Attempting to find image for: "${query}"`)

  if (!GOOGLE_API_KEY) {
    const message = "Google API Key (GOOGLE_VISION_KEY) is not configured. Returning placeholder."
    console.warn(message)
    debugLog.push(`[Google Image Search] ERROR: ${message}`)
    return PLACEHOLDER_IMAGE
  }

  if (!GOOGLE_CSE_ID) {
    const message = "Google Custom Search Engine ID (GOOGLE_CSE_ID) is not configured. Returning placeholder."
    console.warn(message)
    debugLog.push(`[Google Image Search] ERROR: ${message}`)
    return PLACEHOLDER_IMAGE
  }

  const searchParams = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CSE_ID,
    q: query,
    searchType: "image",
    num: "1",
    rights: "cc_publicdomain,cc_attribute,cc_sharealike",
    imgSize: "medium",
  })
  const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`
  debugLog.push(`[Google Image Search] Request URL: ${url.replace(GOOGLE_API_KEY, "[REDACTED_API_KEY]")}`)

  try {
    const response = await fetch(url)
    const responseText = await response.text()

    if (!response.ok) {
      debugLog.push(`[Google Image Search] API Error Response (Status ${response.status}): ${responseText}`)
      console.error("Google Image Search API error:", responseText)
      return PLACEHOLDER_IMAGE
    }

    debugLog.push(`[Google Image Search] API Success Response: ${responseText}`)
    const data = JSON.parse(responseText)
    const firstResult = data.items?.[0]
    const imageUrl = firstResult?.link || PLACEHOLDER_IMAGE

    debugLog.push(`[Google Image Search] Found image URL: ${imageUrl}`)
    return imageUrl
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    debugLog.push(`[Google Image Search] Fetch failed: ${message}`)
    console.error("Failed to fetch from Google Image Search API:", error)
    return PLACEHOLDER_IMAGE
  }
}
