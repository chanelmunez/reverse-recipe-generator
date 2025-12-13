import { type NextRequest, NextResponse } from "next/server"
import { corsResponse, getCorsHeaders, handleOptions } from "@/lib/cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request.headers.get("origin"))
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin")
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return corsResponse(
      NextResponse.json({ error: "URL parameter is required" }, { status: 400 }),
      origin
    )
  }

  try {
    // Validate the URL to prevent errors
    const url = new URL(imageUrl)

    const response = await fetch(url.toString())

    if (!response.ok) {
      return corsResponse(
        NextResponse.json(
          { error: `Failed to fetch image. Status: ${response.status}` },
          { status: response.status }
        ),
        origin
      )
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.startsWith("image/")) {
      return corsResponse(
        NextResponse.json({ error: "The provided URL does not point to a valid image." }, { status: 400 }),
        origin
      )
    }

    // Get the image data as a Blob
    const blob = await response.blob()

    // Return the blob directly with the correct content type and CORS headers
    const corsHeaders = getCorsHeaders(origin)
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...corsHeaders,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    if (message.includes("Invalid URL")) {
      return corsResponse(
        NextResponse.json({ error: "Invalid URL provided." }, { status: 400 }),
        origin
      )
    }
    console.error("Error fetching image:", error)
    return corsResponse(
      NextResponse.json({ error: `Failed to process image URL. ${message}` }, { status: 500 }),
      origin
    )
  }
}
