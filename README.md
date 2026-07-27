# Resume ATS Analyser — Frontend Skeleton

This is step 1 of the build: Supabase-backed auth wired into a Next.js
(App Router) skeleton, ready to deploy to Vercel. The FastAPI backend,
Groq resume parsing, and JSearch job matching come next.

## What's in here

- `app/` — landing page, `/login`, `/signup`, and a protected `/dashboard`
- `app/actions.ts` — server actions for sign up / sign in / sign out
- `lib/supabase/` — browser client, server client, and the middleware
  helper that refreshes the auth session on every request
- `middleware.ts` — redirects unauthenticated visitors away from `/dashboard`
- `supabase/schema.sql` — the `resumes`, `analyses`, and `job_matches`
  tables (with pgvector + row-level security) for the next build step

## 1. Create the Supabase project

1. Go to supabase.com → New project.
2. Once it's up, go to Project Settings → API and copy the **Project URL**
   and **anon public key**.
3. Go to the SQL Editor, paste in `supabase/schema.sql`, and run it.
   This enables pgvector and creates the tables the backend will use later —
   auth itself needs no extra setup, Supabase handles that.

## 2. Local setup

```bash
npm install
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Visit `http://localhost:3000`, create an account, and confirm you land on
`/dashboard` after signing in. By default Supabase requires email
confirmation — for faster local testing you can turn that off under
Authentication → Providers → Email → "Confirm email".

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import it in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   Environment Variables in the Vercel project settings.
4. Deploy. Auth will work immediately since Supabase hosts the actual
   auth backend — Vercel is just serving the Next.js app.

## What's next

- FastAPI backend (deployed separately, e.g. Railway) that receives resume
  uploads, calls Groq to parse/extract keywords, and writes into `resumes`
- A `/dashboard/analyze` flow: pick a target role → FastAPI asks Groq to
  gap-analyze against that role → writes into `analyses`
- A job-matching call to JSearch using the extracted keywords → `job_matches`

Say the word when you want the FastAPI + Groq piece scaffolded next.
# ATS-RESUME-ANALYSER
