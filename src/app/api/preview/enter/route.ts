// route handler with secret and slug
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { isUserAuthorized } from '@tinacms/auth'

export const runtime = 'edge'

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const slug = searchParams.get('slug')

  if (process.env.NEXT_PUBLIC_TINA_CLIENT_ID === undefined) {
    return new Response('Tina Client ID is not defined', { status: 401 })
  }

  if (slug === null) {
    return new Response('Slug is not defined', { status: 401 })
  }

  if (process.env.IS_LOCAL === 'true') {
    // Enter preview mode in local development
    // Enable Draft Mode by setting the cookie
    draftMode().enable()

    // Redirect to the path from the fetched post
    // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
    redirect(slug)
  }

  // Check tina cloud token
  const isAuthorizedRes = await isUserAuthorized({
    token: `Bearer ${token}`,
    clientID: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  })

  if (isAuthorizedRes) {
    // Enable Draft Mode by setting the cookie
    draftMode().enable()

    // Redirect to the path from the fetched post
    // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
    redirect(slug)
  }

  return new Response('Invalid slug', { status: 401 })
}
