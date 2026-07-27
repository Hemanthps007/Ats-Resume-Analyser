import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal-400">
          resume ats analyser
        </p>
        <h1 className="font-display text-4xl leading-tight text-ink-50 sm:text-5xl">
          Know what a hiring filter sees before a human does.
        </h1>
        <p className="mt-4 text-ink-400">
          Upload your resume, target a role, and see the gaps &mdash; plus
          live openings that already match your keywords.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="btn-primary sm:w-auto sm:px-6">
            Create account
          </Link>
          <Link href="/login" className="btn-ghost sm:w-auto sm:px-6">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
