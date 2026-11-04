import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url, resumeText } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in your .env file." },
        { status: 500 }
      );
    }

    if (!url) {
      return NextResponse.json({ error: "No URL provided." }, { status: 400 });
    }

    // Fetch the webpage content with standard headers to avoid scraper blocks
    let html = "";
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        next: { revalidate: 60 }, // cache for 1 minute
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      html = await response.text();
    } catch (fetchErr: any) {
      console.error("Web scraping error:", fetchErr);
      return NextResponse.json(
        { error: `Could not connect to the website: ${fetchErr.message || "Connection failed"}` },
        { status: 422 }
      );
    }

    // Clean HTML using cheerio to extract clean, relevant text content
    const $ = cheerio.load(html);
    $("script, style, svg, nav, footer, iframe, noscript, header, head").remove();
    const cleanText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000); // Send first 8,000 characters for token efficiency

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are an expert technical recruiter and ATS system.
Analyze the following job description extracted from a job posting URL and compare it with the candidate's resume text.

CANDIDATE RESUME:
---
${resumeText || "No resume text provided. Analyze strictly based on job description."}
---

JOB DESCRIPTION WEBPAGE CONTENT:
---
${cleanText}
---

Provide a comprehensive, brutally honest gap analysis and scoring. Return a JSON object with:
1. Target Job Title (under "jobTitle")
2. Company Name (under "company", extract if available or "Not specified")
3. Job Location (under "location", extract if available or "Remote/Unspecified")
4. ATS Score (under "atsScore", an integer 0-100 indicating alignment between the candidate's resume and this job)
5. Matching Skills (under "matchingSkills", a list of strings of skills that the candidate HAS which match this job)
6. Missing Skills / Gaps (under "missingSkills", a list of strings of skills or requirements listed in the job description that are NOT in the candidate's resume)
7. Specific Optimization Suggestions (under "suggestions", an array of objects. Each object should have "type" ("keyword" or "bullet_rewrite" or "general"), "title" (short 2-5 words title), and "description" (detailed explanation on how to tailor the resume for this gap)).
8. Interview Prep Tips (under "interviewTips", an array of strings of potential interview topics or advice based on their gap).

Respond ONLY with a JSON object matching this schema:
{
  "jobTitle": "string",
  "company": "string",
  "location": "string",
  "atsScore": number,
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "suggestions": [
    {
      "type": "string",
      "title": "string",
      "description": "string"
    }
  ],
  "interviewTips": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const gapAnalysis = JSON.parse(responseText);

    return NextResponse.json({ success: true, ...gapAnalysis });
  } catch (error: any) {
    console.error("URL Analysis error:", error);
    let msg = error?.message || "Failed to analyze URL.";
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes("400 Bad Request")) {
      msg = "Invalid Google Gemini API Key. Please verify the GEMINI_API_KEY in your .env file.";
    }
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
