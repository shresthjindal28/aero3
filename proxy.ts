import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect the dashboard and its subroutes
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // if (isProtectedRoute(req)) {
  //   await auth.protect({
  //     unauthenticatedUrl: new URL("/signin", req.url).toString(),
  //   });
  // }
});

export const config = {
  matcher: [
    // Clerk recommended matcher: app routes excluding Next internals & static assets
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    // Always run Clerk for API & explicitly include dashboard
    "/(api|trpc)(.*)",
    "/dashboard(.*)",
  ],
};
