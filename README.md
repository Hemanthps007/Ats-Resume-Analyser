# Resume ATS Analyser

An intelligent, machine-learning powered ATS (Applicant Tracking System) resume analyzer built with Next.js 14 App Router, TypeScript, SQLite (`better-sqlite3`), and a local Supervised ML Scoring Model (TF-IDF, BM25, and Regularized Feature Regression).

Zero external API keys required — no Gemini or RapidAPI dependencies needed!

## Architecture & Features

- `app/` — Modern dark-glassmorphism landing page, `/login`, `/signup`, and protected interactive `/dashboard`
- `app/actions.ts` — Server actions for sign up, sign in, and sign out backed by SQLite
- `app/api/parse-resume/` — Native, local resume text extraction (PDF / DOCX / TXT) and structured metadata NLP parsing
- `app/api/analyze-jd/` — Direct Job Description text gap analysis using the trained Machine Learning ATS engine
- `app/api/analyze-url/` — Live job description scraping (via `cheerio`) and local ML semantic gap/ATS score analysis
- `app/api/rewrite-bullet/` — Google XYZ formula bullet point optimization studio (Metrics + Power Action Verbs)
- `app/api/live-jobs/` — Real-time job opportunity discovery and keyword-overlap scoring (Remotive API + market benchmarks)
- `lib/ml/` — Trained Machine Learning model (`atsModel.ts`, `atsModelWeights.json`, `resumeParser.ts`)
- `lib/pdfParser.ts` — Zero-dependency native PDF stream decompressor and text extractor
- `lib/rolesData.ts` — 14+ 2026 tech market roles taxonomy, skills matrix, and seniority modifiers
- `lib/db.ts` — SQLite database initialization with WAL mode, salt + `crypto.scrypt` password hashing, and session persistence
- `lib/auth.ts` — Server-side session verification helper (`getCurrentUser()`)
- `middleware.ts` — Edge middleware session check guarding protected routes (`/dashboard`)

## 1. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Zero API Keys required!)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 2. Machine Learning ATS Engine

The analyzer uses a supervised Ridge Regression model trained on tech market hiring benchmarks (`scripts/train_ats_model.py`):
1. **TF-IDF & BM25 Relevance**: Evaluates semantic keyword alignment between candidate resume and target role.
2. **Quantifiable Metrics Density**: Detects scale numbers, percentages, and business impact.
3. **Structural Health Index**: Verifies core ATS sections (Summary, Experience, Skills, Education, Projects).
4. **Action-to-Passive Verb Ratio**: Rewards power verbs ("Architected", "Spearheaded") and penalizes passive phrasing ("worked on", "assisted with").
5. **Local Inference**: Runs in sub-1 millisecond with zero latency, zero rate limits, and 100% data privacy.
