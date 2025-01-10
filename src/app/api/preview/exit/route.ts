// route handler with secret and slug
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug === null) {
    return new Response('Slug is not defined', { status: 401 })
  }

  // Enter preview mode in local development
  // Enable Draft Mode by setting the cookie
  (await draftMode()).disable()

  // Redirect to the path from the fetched post
  // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
  redirect(slug)
}
