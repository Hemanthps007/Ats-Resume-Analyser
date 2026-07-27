import Link from "next/link";
import { signUp } from "@/app/actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-400">
          get started
        </p>
        <h1 className="font-display text-2xl text-ink-50">Create account</h1>

        <form action={signUp} className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-ink-400">Email</label>
            <input className="field" type="email" name="email" required autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-400">Password</label>
            <input
              className="field"
              type="password"
              name="password"
              minLength={6}
              required
            />
          </div>

          {searchParams.error && (
            <p className="rounded-card border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {searchParams.error}
            </p>
          )}
          {searchParams.message && (
            <p className="rounded-card border border-signal-600 bg-signal-100/10 px-3 py-2 text-sm text-signal-300">
              {searchParams.message}
            </p>
          )}

          <button type="submit" className="btn-primary">
            Create account
          </button>
        </form>

        <p className="mt-5 text-sm text-ink-400">
          Already have an account?{" "}
          <Link href="/login" className="text-signal-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
