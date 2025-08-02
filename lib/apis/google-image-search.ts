const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

const PLACEHOLDER_IMAGE = "/placeholder.svg"

/**
 * Searches for a free-to-use image using the Google Custom Search API.
 * @param {string} query - The search term (e.g., an ingredient name).
 * @returns {Promise<string>} A promise that resolves to an image URL or a placeholder.
 */
export async function searchForImage(query: string): Promise<string> {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.warn("Google Search API credentials are not configured. Returning placeholder.")
    return PLACEHOLDER_IMAGE
  }

  // Construct the search URL
  const searchParams = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CSE_ID,
    q: query,
    searchType: "image",
    num: "1", // We only need the top result
    // Filter for images that are labeled for reuse
    rights: "cc_publicdomain,cc_attribute,cc_sharealike",
    imgSize: "medium",
  })
  const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Google Image Search API error:", errorData.error.message)
      return PLACEHOLDER_IMAGE
    }

    const data = await response.json()
    const firstResult = data.items?.[0]

    // Return the image link or a placeholder if no results are found
    return firstResult?.link || PLACEHOLDER_IMAGE
  } catch (error) {
    console.error("Failed to fetch from Google Image Search API:", error)
    return PLACEHOLDER_IMAGE
  }
}
