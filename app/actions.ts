"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyErrorMessage(message: string): string {
  if (
    message.includes("Unexpected token") || 
    message.includes("DOCTYPE") || 
    message.includes("doctype") ||
    message.includes("Failed to fetch")
  ) {
    return "Configuration error: Please ensure your NEXT_PUBLIC_SUPABASE_URL in .env.local is set to a valid API URL (e.g., https://<id>.supabase.co) rather than the dashboard page URL.";
  }
  return message;
}

function handleAuthError(err: any, type: "signup" | "login") {
  if (err.digest?.startsWith("NEXT_REDIRECT")) {
    throw err;
  }
  console.error(`${type} error:`, err);
  const msg = err.message || "";
  redirect(`/${type}?error=${encodeURIComponent(getFriendlyErrorMessage(msg))}`);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));

  if (!emailRegex.test(email)) {
    redirect(`/signup?error=${encodeURIComponent("Please enter a valid email address.")}`);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(getFriendlyErrorMessage(error.message))}`);
    }

    if (data?.session) {
      revalidatePath("/", "layout");
      redirect("/dashboard");
    }
  } catch (err: any) {
    handleAuthError(err, "signup");
  }

  redirect("/signup?message=Check your email to confirm your account");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const next = String(formData.get("next") || "/dashboard");

  if (!emailRegex.test(email)) {
    redirect(`/login?error=${encodeURIComponent("Please enter a valid email address.")}`);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/login?error=${encodeURIComponent(getFriendlyErrorMessage(error.message))}`);
    }
  } catch (err: any) {
    handleAuthError(err, "login");
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

