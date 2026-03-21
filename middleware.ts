import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /favicon.ico, /_vercel (static files)
    "/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)",
  ],
}
