"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createUser, verifyUser, createSession, deleteSession } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function handleAuthError(err: any, type: "signup" | "login") {
  if (err.digest?.startsWith("NEXT_REDIRECT")) {
    throw err;
  }
  console.error(`${type} error:`, err);
  const msg = err.message || "An unexpected error occurred.";
  redirect(`/${type}?error=${encodeURIComponent(msg)}`);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));

  if (!emailRegex.test(email)) {
    redirect(`/signup?error=${encodeURIComponent("Please enter a valid email address.")}`);
  }

  if (!password || password.length < 6) {
    redirect(`/signup?error=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }

  try {
    const user = createUser(email, password);
    const token = createSession(user.id);

    cookies().set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  } catch (err: any) {
    handleAuthError(err, "signup");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const next = String(formData.get("next") || "/dashboard");

  if (!emailRegex.test(email)) {
    redirect(`/login?error=${encodeURIComponent("Please enter a valid email address.")}`);
  }

  try {
    const user = verifyUser(email, password);
    if (!user) {
      redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
    }

    const token = createSession(user.id);

    cookies().set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  } catch (err: any) {
    handleAuthError(err, "login");
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  try {
    const token = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      deleteSession(token);
    }
    cookies().delete(SESSION_COOKIE_NAME);
  } catch (err) {
    console.error("Sign out error:", err);
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
