const GOOGLE_API_KEY = process.env.GOOGLE_VISION_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

const PLACEHOLDER_IMAGE = "/placeholder.svg"

/**
 * Searches for a free-to-use image using the Google Custom Search API.
 * @param {string} query - The search term (e.g., an ingredient name).
 * @param {string[]} debugLog - An array to push debug messages to.
 * @returns {Promise<string>} A promise that resolves to an image URL or a placeholder.
 */
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

  // Construct the search URL with improved parameters for better results
  const searchParams = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CSE_ID,
    q: `${query} food ingredient`, // Add context for better food-related results
    searchType: "image",
    num: "3", // Get multiple results to have fallbacks
    rights: "cc_publicdomain,cc_attribute,cc_sharealike,cc_nonderived",
    imgSize: "medium",
    imgType: "photo", // Prefer actual photos over graphics
    safe: "active", // Enable safe search
    fileType: "jpg,png,webp", // Specify supported image formats
  })
  const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`
  // Redact key from log for security
  debugLog.push(`[Google Image Search] Request URL: ${url.replace(GOOGLE_API_KEY, "[REDACTED_API_KEY]")}`)

  try {
    const response = await fetch(url)
    const responseText = await response.text()

    if (!response.ok) {
      debugLog.push(`[Google Image Search] API Error Response (Status ${response.status}): ${responseText}`)
      console.error("Google Image Search API error:", responseText)
      return PLACEHOLDER_IMAGE
    }

    const data = JSON.parse(responseText)
    
    if (!data.items || data.items.length === 0) {
      debugLog.push(`[Google Image Search] No images found for query: "${query}"`)
      return PLACEHOLDER_IMAGE
    }

    // Try to find the best image from the results
    let bestImageUrl = PLACEHOLDER_IMAGE
    
    for (const item of data.items) {
      if (item.link && item.image) {
        // Prefer images with thumbnails and reasonable dimensions
        const hasGoodThumbnail = item.image.thumbnailLink && 
                                item.image.thumbnailWidth > 100 && 
                                item.image.thumbnailHeight > 100
        
        if (hasGoodThumbnail) {
          bestImageUrl = item.image.thumbnailLink // Use thumbnail for faster loading
          debugLog.push(`[Google Image Search] Using thumbnail: ${bestImageUrl}`)
          break
        } else if (item.link) {
          bestImageUrl = item.link // Fallback to original image
          debugLog.push(`[Google Image Search] Using original image: ${bestImageUrl}`)
          break
        }
      }
    }

    if (bestImageUrl === PLACEHOLDER_IMAGE) {
      debugLog.push(`[Google Image Search] No suitable images found, using placeholder`)
    }

    return bestImageUrl
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    debugLog.push(`[Google Image Search] Fetch failed: ${message}`)
    console.error("Failed to fetch from Google Image Search API:", error)
    return PLACEHOLDER_IMAGE
  }
}
