// route handler with secret and slug
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

const isUserAuthorized = async (args: { clientID: string; token: string }) => {
  const clientID = args.clientID;
  const token = args.token;

  try {
    const tinaCloudRes = await fetch(
      `https://identity.tinajs.io/v2/apps/${clientID}/currentUser`,
      {
        headers: new Headers({
          "Content-Type": "application/json",
          authorization: token,
        }),
        method: "GET",
      }
    );

    if (tinaCloudRes.ok) {
      const user = await tinaCloudRes.json();
      return user;
    }

    return null;
  } catch (_error) {
    return null;
  }
};

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const slug = searchParams.get("slug");

  if (process.env.NEXT_PUBLIC_TINA_CLIENT_ID === undefined) {
    return new Response("Tina Client ID is not defined", { status: 401 });
  }

  if (slug === null) {
    return new Response("Slug is not defined", { status: 401 });
  }

  // Validate slug to prevent open redirect vulnerabilities
  // Only allow paths that start with / and don't contain protocol or domain
  if (!slug.startsWith("/") || slug.includes("://") || slug.includes("..")) {
    return new Response("Invalid slug format", { status: 400 });
  }

  if (process.env.IS_LOCAL === "true") {
    // Enter preview mode in local development
    // Enable Draft Mode by setting the cookie
    (await draftMode()).enable();

    // Redirect to the path from the fetched post
    // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
    redirect(slug);
  }

  // Check tina cloud token
  const isAuthorizedRes = await isUserAuthorized({
    token: `Bearer ${token}`,
    clientID: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  });

  if (isAuthorizedRes) {
    // Enable Draft Mode by setting the cookie
    (await draftMode()).enable();

    // Redirect to the path from the fetched post
    // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
    redirect(slug);
  }

  return new Response("Invalid slug", { status: 401 });
}
