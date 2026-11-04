import { cookies } from "next/headers";
import { getSessionUser, type UserRecord } from "./db";

export const SESSION_COOKIE_NAME = "ats_session_token";

/**
 * Get currently authenticated user in Server Components and Route Handlers
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    return getSessionUser(token);
  } catch (error) {
    console.error("Error retrieving session user:", error);
    return null;
  }
}

