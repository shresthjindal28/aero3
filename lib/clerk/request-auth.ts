import "server-only";
import { createClerkClient } from "@clerk/backend";
import type { User } from "@clerk/nextjs/server";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is missing from .env.local");
    }
    clerkClient = createClerkClient({ secretKey });
  }
  return clerkClient;
}

/**
 * Auth for multipart API routes that must NOT go through clerkMiddleware
 * (middleware consumes the body → "Response body object should not be disturbed or locked").
 */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing from .env.local");
  }

  const client = getClerkClient();
  const requestState = await client.authenticateRequest(req, {
    publishableKey,
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  if (!requestState.isSignedIn) {
    return null;
  }

  const { userId } = requestState.toAuth();
  if (!userId) {
    return null;
  }

  return client.users.getUser(userId) as Promise<User>;
}
