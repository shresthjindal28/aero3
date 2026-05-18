import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/signin", req.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Pages + JSON API routes only. Multipart upload routes are excluded so
    // Clerk middleware never runs on them (avoids locked request body).
    "/((?!.+\\.[\\w]+$|_next|api/doctor/register|api/patient/report|api/update-soapnotes|api/rag-update).*)",
    "/",
    "/dashboard(.*)",
  ],
};
