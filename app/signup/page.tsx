import Link from "next/link";
import { signUp } from "@/app/actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 bg-ink-950">
      {/* Background glow */}
      <div className="pointer-events-none absolute h-[400px] w-[500px] rounded-full bg-cyber-indigo/10 blur-[130px]" />

      <div className="relative w-full max-w-md rounded-2xl border border-ink-800 bg-ink-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal-500 to-cyber-cyan shadow-glow">
            <svg className="h-4 w-4 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-white">ATS Resume Radar</span>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-400">get started free</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-xs text-ink-400">Optimize your resume against 2026 market standards in seconds.</p>

        <form action={signUp} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink-300">Email address</label>
            <input
              className="field"
              type="email"
              name="email"
              placeholder="you@domain.com"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink-300">Password (min 6 characters)</label>
            <input
              className="field"
              type="password"
              name="password"
              minLength={6}
              placeholder="••••••••"
              required
            />
          </div>

          {searchParams.error && (
            <div className="rounded-card border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-200">
              <p className="font-semibold text-red-300">Registration Error</p>
              <p className="mt-0.5">{searchParams.error}</p>
            </div>
          )}

          {searchParams.message && (
            <div className="rounded-card border border-signal-500/40 bg-signal-500/10 p-3 text-xs text-signal-300">
              {searchParams.message}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-2.5 text-sm font-semibold mt-2">
            Create Free Account
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-ink-800/80 text-center text-xs text-ink-400">
          Already have an account?{" "}
          <Link href="/login" className="text-signal-400 font-semibold hover:underline">
            Sign in here →
          </Link>
        </div>
      </div>
    </main>
  );
}
