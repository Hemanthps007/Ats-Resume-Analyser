import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { jdText, resumeText } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in your .env file." },
        { status: 500 }
      );
    }

    if (!jdText || jdText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid job description (at least 20 characters)." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a Principal Technical Recruiter and modern ATS Screening System expert.
Analyze the following Job Description text and compare it thoroughly against the Candidate's Resume.

CANDIDATE RESUME:
---
${resumeText || "No resume text provided. Analyze strictly based on job description."}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 10000)}
---

Evaluate the alignment strictly and realistically based on 2026 tech market standards.
Return a valid JSON object matching this schema:
{
  "jobTitle": "Extracted target job title or role (e.g. Senior Backend Engineer)",
  "company": "Extracted hiring company name or 'Company Not Specified'",
  "location": "Extracted location or 'Remote / Unspecified'",
  "atsScore": 75,
  "matchingSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Critical Missing Skill 1", "Missing Skill 2"],
  "suggestions": [
    {
      "type": "keyword | bullet_rewrite | general",
      "title": "Short punchy recommendation title",
      "description": "Specific, actionable instruction explaining how the candidate can integrate this gap into their resume naturally"
    }
  ],
  "interviewTips": [
    "Targeted technical topic or behavioral question likely to be asked based on this job description"
  ]
}

ATS Scoring guidelines:
- atsScore must be an integer between 10 and 98 based on keyword density, relevant experience, and hard skill overlaps.
- Include at least 4-6 matching skills (if present) and 3-5 missing skills/requirements.
- suggestions should include concrete examples of how to rewrite achievements.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("JD Analysis error:", error);
    let msg = error?.message || "Failed to analyze Job Description.";
    if (
      msg.includes("API key not valid") ||
      msg.includes("API_KEY_INVALID") ||
      msg.includes("400 Bad Request")
    ) {
      msg = "Invalid Google Gemini API Key. Please verify the GEMINI_API_KEY in your .env file.";
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
