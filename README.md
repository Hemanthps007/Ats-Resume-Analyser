# Resume ATS Analyser 

An AI-powered ATS (Applicant Tracking System) resume analyzer built with Next.js 14 App Router, TypeScript, SQLite (`better-sqlite3`), and Google Gemini 1.5 Flash.

## What's in here

- `app/` — Landing page, `/login`, `/signup`, and protected `/dashboard`
- `app/actions.ts` — Server actions for sign up, sign in, and sign out backed by SQLite
- `app/api/parse-resume/` — Resume text extraction (PDF / DOCX / TXT) and structured JSON parsing via Google Gemini 1.5 Flash
- `app/api/analyze-url/` — Live job description scraping (via `cheerio`) and AI semantic gap/ATS score analysis
- `app/api/live-jobs/` — Real-time job opportunity discovery and keyword-overlap scoring (via JSearch / Remotive APIs)
- `lib/db.ts` — SQLite database initialization with WAL mode, salt + `crypto.scrypt` password hashing, and session persistence
- `lib/auth.ts` — Server-side session verification helper (`getCurrentUser()`)
- `middleware.ts` — Edge middleware session check guarding protected routes (`/dashboard`)

## 1. Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.local.example .env.local
# Set your GEMINI_API_KEY (and optionally RAPIDAPI_JSEARCH_KEY) in .env.local

# 3. Start development server
npm run dev
```

The SQLite database will automatically initialize at `data/ats.db` on first run.

## 2. Authentication Flow

- **Storage**: Local SQLite database stored at `data/ats.db`.
- **Security**: Passwords hashed with standard Node.js `crypto.scrypt` using unique per-user cryptographic salts and verified using `crypto.timingSafeEqual`.
- **Sessions**: Stored in the `sessions` table and managed through an HTTP-only secure cookie (`ats_session_token`).
