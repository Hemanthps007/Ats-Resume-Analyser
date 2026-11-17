import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { bullet, targetRole, keywords } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in your .env file." },
        { status: 500 }
      );
    }

    if (!bullet || bullet.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a bullet point to optimize." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are an elite Executive Tech Resume Strategist and ATS Specialist.
Transform the following resume bullet point into 3 high-impact, ATS-optimized bullet points tailored for the target role: "${targetRole || "Software Engineer"}".

ORIGINAL BULLET POINT:
"${bullet}"

TARGET KEYWORDS TO INTEGRATE NATURALLY (IF RELEVANT):
${(keywords || []).slice(0, 6).join(", ") || "Performance, scalability, architecture"}

RULES FOR REWRITES:
1. Follow Google's XYZ Formula: "Accomplished [X] as measured by [Y] by doing [Z]".
2. Begin with a powerful active verb (e.g., Architected, Spearheaded, Engineered, Optimized, Automated, Accelerated, Reduced).
3. Include realistic, quantifiable metrics (percentages, throughput, latency, user counts, or operational efficiency).
4. Remove passive language (no "worked on", "helped", "responsible for").
5. Keep each bullet concise, readable, and under 35 words.

Respond ONLY with a JSON object matching this schema:
{
  "original": "${bullet.replace(/"/g, '\\"')}",
  "rewrites": [
    {
      "style": "High-Impact & Metrics Driven",
      "text": "Rewritten bullet point with strong numbers and power verbs",
      "actionVerb": "Spearheaded",
      "metricHighlight": "reduced latency by 42%"
    },
    {
      "style": "Technical Architecture & Scalability",
      "text": "Rewritten bullet point emphasizing technical design and stack depth",
      "actionVerb": "Architected",
      "metricHighlight": "supporting 250K concurrent users"
    },
    {
      "style": "Product & Business Velocity",
      "text": "Rewritten bullet point highlighting business value and delivery speed",
      "actionVerb": "Accelerated",
      "metricHighlight": "cutting sprint cycle times by 30%"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Bullet rewrite error:", error);
    let msg = error?.message || "Failed to rewrite bullet point.";
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
