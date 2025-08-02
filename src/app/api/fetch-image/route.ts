import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    const url = new URL(imageUrl)

    const response = await fetch(url.toString())

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image. Status: ${response.status}` },
        { status: response.status },
      )
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "The provided URL does not point to a valid image." }, { status: 400 })
    }

    const blob = await response.blob()

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    if (message.includes("Invalid URL")) {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 })
    }
    console.error("Error fetching image:", error)
    return NextResponse.json({ error: `Failed to process image URL. ${message}` }, { status: 500 })
  }
}
