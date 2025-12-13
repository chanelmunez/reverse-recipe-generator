import ReportPageClient from "./client"

// Required for static export - generates a fallback page for client-side routing
export function generateStaticParams() {
  // Return a placeholder slug - actual IDs are handled client-side
  return [{ slug: ['_placeholder'] }]
}

export default function ReportPage() {
  return <ReportPageClient />
}
