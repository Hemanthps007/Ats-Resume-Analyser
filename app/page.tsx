import Link from "next/link";

export default function Home() {
  const marketKeywords = [
    { name: "Next.js 15 App Router", role: "Frontend", hot: true },
    { name: "Retrieval-Augmented Gen (RAG)", role: "AI & ML", hot: true },
    { name: "Kubernetes & Terraform", role: "DevOps", hot: true },
    { name: "Vector DBs (Pinecone / Chroma)", role: "AI & Data", hot: true },
    { name: "TypeScript Strict Mode", role: "Fullstack", hot: false },
    { name: "Distributed Microservices", role: "Backend", hot: true },
    { name: "PyTorch & vLLM Serving", role: "AI & ML", hot: true },
    { name: "Kafka & Event-Driven Arch", role: "Backend", hot: false },
    { name: "Playwright & Vitest", role: "QA / SDET", hot: false },
    { name: "Google XYZ Impact Formula", role: "ATS Strategy", hot: true },
    { name: "PostgreSQL & Prisma ORM", role: "Fullstack", hot: false },
    { name: "OWASP Top 10 & Zero-Trust", role: "Cybersecurity", hot: true },
  ];

  const featuredRoles = [
    {
      title: "AI & ML Engineer",
      demand: "Explosive Demand",
      salary: "$150k - $210k",
      keywords: ["PyTorch", "RAG", "Vector DBs", "LangChain", "vLLM", "Fine-Tuning"],
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Frontend Engineer",
      demand: "High Demand",
      salary: "$125k - $165k",
      keywords: ["React 19", "Next.js", "TypeScript", "Tailwind", "Web Vitals", "Vitest"],
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "DevOps & Cloud Engineer",
      demand: "Explosive Demand",
      salary: "$140k - $190k",
      keywords: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker", "Prometheus"],
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Backend Engineer",
      demand: "High Demand",
      salary: "$135k - $180k",
      keywords: ["Go / Node.js", "PostgreSQL", "Kafka", "Microservices", "Redis", "gRPC"],
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100 selection:bg-signal-500 selection:text-ink-950">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-signal-500 to-cyber-cyan shadow-glow">
              <svg className="h-5 w-5 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-tight text-white text-base">ATS Resume Radar</span>
                <span className="rounded-full bg-signal-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-signal-400 border border-signal-500/30">
                  2026 Edition
                </span>
              </div>
              <p className="text-[11px] text-ink-400">Market Intelligence & Resume Optimization</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-xs px-4 py-2">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-xs px-4 py-2">
              Get Started Free →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-signal-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute top-40 right-10 h-[400px] w-[500px] rounded-full bg-cyber-indigo/10 blur-[130px]" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-signal-500/30 bg-signal-500/10 px-3.5 py-1 text-xs text-signal-300 backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-signal-400 animate-ping" />
            <span>Calibrated with real-time 2026 hiring algorithms</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.12]">
            Know What ATS Filters See{" "}
            <span className="bg-gradient-to-r from-signal-400 via-cyber-cyan to-cyber-violet bg-clip-text text-transparent">
              Before a Human Does.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg">
            75% of resumes are discarded by automated applicant tracking systems (Workday, Greenhouse, Lever) without human review. 
            Evaluate your resume against <strong className="text-white">14+ modern job taxonomies</strong>, extract critical missing keywords, 
            and transform weak bullets using Google&apos;s XYZ impact formula.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/signup" className="btn-primary text-sm px-7 py-3 w-full sm:w-auto">
              Scan Your Resume Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link href="/login" className="btn-ghost text-sm px-6 py-3 w-full sm:w-auto">
              View Sample Scan Results
            </Link>
          </div>

          {/* Social Proof & Metrics */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-y border-ink-800/80 py-6 text-xs text-ink-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-signal-400">14+</span>
              <span>Curated Market Roles</span>
            </div>
            <div className="h-4 w-px bg-ink-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-cyber-cyan">4-Pillar</span>
              <span>Diagnostic Scoring</span>
            </div>
            <div className="h-4 w-px bg-ink-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-purple-400">XYZ</span>
              <span>Google Bullet Rewriter</span>
            </div>
            <div className="h-4 w-px bg-ink-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-emerald-400">Live</span>
              <span>Direct Job Radar</span>
            </div>
          </div>
        </div>

        {/* Interactive ATS Scanner Preview Visual */}
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="relative rounded-2xl border border-ink-750 bg-ink-900/80 p-4 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between border-b border-ink-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-ink-400">ATS Assessment Console • Senior AI Engineer</span>
              </div>
              <span className="rounded bg-signal-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-signal-400 border border-signal-500/20">
                ACTIVE RADAR
              </span>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {/* Score Gauge Mock */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-ink-800 bg-ink-950/60 p-5 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">Master ATS Score</p>
                <div className="relative my-3 flex h-28 w-28 items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="56" cy="56" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-ink-800" />
                    <circle
                      cx="56"
                      cy="56"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset="24"
                      strokeLinecap="round"
                      fill="transparent"
                      className="text-signal-400"
                    />
                  </svg>
                  <span className="absolute font-display text-3xl font-extrabold text-white">91%</span>
                </div>
                <span className="rounded-full bg-signal-500/15 px-3 py-1 font-mono text-xs font-semibold text-signal-300">
                  Top 5% Candidate Tier
                </span>
              </div>

              {/* Keyword Diagnostic Mock */}
              <div className="col-span-2 rounded-xl border border-ink-800 bg-ink-950/60 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">Role Keyword Match</p>
                  <span className="text-xs text-signal-400 font-semibold">12 of 14 Matched</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-signal-500/15 border border-signal-500/30 px-2 py-1 text-xs text-signal-300 font-mono">
                    ✓ PyTorch 2.4
                  </span>
                  <span className="rounded-md bg-signal-500/15 border border-signal-500/30 px-2 py-1 text-xs text-signal-300 font-mono">
                    ✓ RAG Pipelines
                  </span>
                  <span className="rounded-md bg-signal-500/15 border border-signal-500/30 px-2 py-1 text-xs text-signal-300 font-mono">
                    ✓ Pinecone Vector DB
                  </span>
                  <span className="rounded-md bg-signal-500/15 border border-signal-500/30 px-2 py-1 text-xs text-signal-300 font-mono">
                    ✓ vLLM Serving
                  </span>
                  <span className="rounded-md bg-signal-500/15 border border-signal-500/30 px-2 py-1 text-xs text-signal-300 font-mono">
                    ✓ LoRA Fine-Tuning
                  </span>
                  <span className="rounded-md bg-signal-500/15 border border-signal-500/30 px-2 py-1 text-xs text-signal-300 font-mono">
                    ✓ CUDA Latency Tuning
                  </span>
                  <span className="rounded-md bg-red-500/15 border border-red-500/30 px-2 py-1 text-xs text-red-300 font-mono">
                    + MLflow Pipelines (Missing)
                  </span>
                  <span className="rounded-md bg-red-500/15 border border-red-500/30 px-2 py-1 text-xs text-red-300 font-mono">
                    + Triton Inference (Missing)
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-ink-750 bg-ink-900/90 p-3 text-xs">
                  <span className="font-mono text-signal-400 font-bold">AI Recommended Bullet: </span>
                  <span className="text-ink-300">
                    &quot;Architected distributed RAG architecture using LangChain and Pinecone, cutting query latency by 52% across 2M+ monthly queries.&quot;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Market Ticker */}
      <section className="border-y border-ink-800 bg-ink-900/40 py-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 mb-2">
          <span className="flex h-2 w-2 rounded-full bg-signal-400 animate-pulse" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-400">
            Current High-Demand Market Keywords Tracked:
          </p>
        </div>
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex gap-3 whitespace-nowrap">
            {[...marketKeywords, ...marketKeywords].map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-750 bg-ink-900/90 px-3.5 py-1 text-xs text-ink-200"
              >
                <span className="font-medium text-white">{item.name}</span>
                <span className="font-mono text-[10px] text-ink-500">({item.role})</span>
                {item.hot && (
                  <span className="rounded bg-signal-500/20 px-1 text-[9px] font-bold text-signal-400">HOT</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars Diagnostic Architecture */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-400">scientific approach</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            The 4-Pillar ATS Diagnostic Engine
          </h2>
          <p className="mt-3 text-sm text-ink-400">
            Legacy analyzers only count basic words. Our engine evaluates your resume against the exact multi-dimensional scoring weights used by Fortune 500 hiring pipelines.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-panel-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-500/10 text-signal-400 font-mono font-bold text-sm border border-signal-500/20 mb-4">
              35%
            </div>
            <h3 className="font-display text-base font-bold text-white">Keyword Density & Alignment</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              Evaluates critical hard skills, libraries, frameworks, and architecture patterns specific to your target job profile.
            </p>
          </div>

          <div className="glass-panel-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-cyan/10 text-cyber-cyan font-mono font-bold text-sm border border-cyber-cyan/20 mb-4">
              25%
            </div>
            <h3 className="font-display text-base font-bold text-white">Quantified Impact & Scale</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              Detects percentage improvements, throughput multipliers, revenue metrics, and user scale that distinguish senior engineers.
            </p>
          </div>

          <div className="glass-panel-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-violet/10 text-cyber-violet font-mono font-bold text-sm border border-cyber-violet/20 mb-4">
              20%
            </div>
            <h3 className="font-display text-base font-bold text-white">ATS Structural Health</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              Scans for section completeness (Summary, Experience, Skills, Education, Projects) and unparseable layout bottlenecks.
            </p>
          </div>

          <div className="glass-panel-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-sm border border-amber-500/20 mb-4">
              20%
            </div>
            <h3 className="font-display text-base font-bold text-white">Dynamic Action Verbs</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              Flags passive, weak language (&quot;worked on&quot;, &quot;helped with&quot;) and replaces with high-authority verbs (&quot;Architected&quot;, &quot;Spearheaded&quot;).
            </p>
          </div>
        </div>
      </section>

      {/* Featured Market Career Tracks */}
      <section className="border-t border-ink-800 bg-ink-900/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-400">market taxonomy</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-white">Specialized Career Tracks</h2>
              <p className="mt-1 text-sm text-ink-400">
                Calibrated keyword benchmarks updated for the 2026 hiring landscape.
              </p>
            </div>
            <Link href="/signup" className="text-xs font-semibold text-signal-400 hover:text-signal-300 flex items-center gap-1">
              Explore All 14 Roles in Dashboard →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRoles.map((role, idx) => (
              <div key={idx} className="glass-panel p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold border ${role.badgeColor}`}>
                      {role.demand}
                    </span>
                    <span className="font-mono text-[10px] text-ink-400">{role.salary}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">{role.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {role.keywords.map((kw, kIdx) => (
                      <span key={kIdx} className="rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-ink-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-ink-800/80">
                  <Link href="/login" className="text-xs text-signal-400 font-medium hover:underline flex items-center gap-1">
                    Benchmark Resume →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Comparison */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-400">the difference</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-white">
            Traditional Resume vs. ATS-Engineered Resume
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Weak Example */}
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-xs font-bold text-red-400">
                ❌ WEAK / DISCARDED (ATS SCORE: 42%)
              </span>
            </div>
            <ul className="space-y-3 text-xs text-ink-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>&quot;Worked on frontend components for our e-commerce portal and helped fix bugs.&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>&quot;Responsible for backend server maintenance and database queries.&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>No metrics, no scale, no framework versions, passive tone, ignored by ATS scanners.</span>
              </li>
            </ul>
          </div>

          {/* Optimized Example */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-6 shadow-glow">
            <div className="flex items-center justify-between mb-3">
              <span className="rounded bg-signal-500/20 px-2 py-0.5 font-mono text-xs font-bold text-signal-300">
                ✓ ATS-OPTIMIZED (ATS SCORE: 94%)
              </span>
            </div>
            <ul className="space-y-3 text-xs text-ink-200 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-signal-400 font-bold">✓</span>
                <span>&quot;Architected and migrated flagship e-commerce application to Next.js 14 and TypeScript, reducing LCP by 45% and eliminating 80+ production bugs.&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-signal-400 font-bold">✓</span>
                <span>&quot;Engineered distributed Node.js microservices with Redis caching, supporting 150K concurrent users and decreasing API latency from 320ms to 38ms.&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-signal-400 font-bold">✓</span>
                <span>Google XYZ impact formula, clear keywords, measurable ROI, passes directly to hiring manager.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-t border-ink-800 bg-gradient-to-b from-ink-900/60 to-ink-950 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Optimize Your Resume for Top 2026 Roles?
          </h2>
          <p className="mt-4 text-sm text-ink-300">
            Join thousands of engineers who used ATS Resume Radar to land interviews at Google, Stripe, Meta, and high-growth startups.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto">
              Create Your Free Account
            </Link>
            <Link href="/login" className="btn-ghost text-sm px-7 py-3.5 w-full sm:w-auto">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-800/80 bg-ink-950 py-8 text-center text-xs text-ink-500">
        <p>© 2026 ATS Resume Radar. Engineered for the modern tech job market.</p>
      </footer>
    </main>
  );
}
