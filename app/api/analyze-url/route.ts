import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url, resumeText } = await request.json();
    const clientApiKey = request.headers.get("x-gemini-key");
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please configure it in Settings or .env.local." },
        { status: 400 }
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
      .trim();

    if (!cleanText || cleanText.length < 100) {
      return NextResponse.json(
        { error: "The webpage content seems too short or protected. Please paste the job description text instead." },
        { status: 400 }
      );
    }

    // Truncate webpage content if it's exceptionally large to save tokens
    const truncatedPageText = cleanText.substring(0, 15000);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a professional ATS Recruiter & Gap Analyst. 
Analyze the job description text from the website URL provided below and evaluate it against the candidate's resume.

JOB DESCRIPTION WEBPAGE CONTENT:
"""
${truncatedPageText}
"""

CANDIDATE RESUME TEXT:
"""
${resumeText || "No resume uploaded yet. Evaluate the job posting text generally."}
"""

Evaluate the following in details:
1. Job Title (under "jobTitle")
2. Company Name (under "company") - try to extract from text or URL domain if not clear
3. Location (under "location")
4. ATS Match Score (under "atsScore", an integer from 0 to 100 based on how well the candidate's resume matches the job description. If no resume is uploaded, default to 0)
5. Matching Skills (under "matchingSkills", a list of strings of tools, skills or qualifications in the job that are also in the resume)
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
    return NextResponse.json(
      { error: error.message || "Failed to analyze URL." },
      { status: 500 }
    );
  }
}
