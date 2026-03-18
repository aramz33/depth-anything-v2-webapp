import { redirect } from "next/navigation"

// The middleware should always redirect / to /fr or /en.
// This fallback handles edge cases where middleware is bypassed.
export default function RootPage() {
  redirect("/fr")
}
