import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in your .env file." },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "";
    const fileName = file.name || "";

    let resumeJson: any = null;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // If PDF, process base64 bytes directly with Gemini's native PDF intake
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const base64Data = buffer.toString("base64");
      const prompt = `You are a professional ATS Resume Parser. Read and parse this resume PDF.
Extract the following information:
1. Candidate Name (under key "name")
2. Email Address (under key "email")
3. Contact Number (under key "phone")
4. A clean list of skills/technologies mentioned in the resume (under key "skills" as an array of strings)
5. A brief summary of their professional experience (under key "summary" as a string)
6. Raw reconstructed text of the resume (under key "raw_text")

Respond ONLY with a JSON object matching this schema:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "summary": "string",
  "raw_text": "reconstructed plain text from the PDF"
}`;

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf",
          },
        },
        prompt,
      ]);

      const responseText = result.response.text();
      resumeJson = JSON.parse(responseText);
    } else {
      let textContent = "";

      if (
        mimeType.includes("wordprocessingml") ||
        fileName.endsWith(".docx")
      ) {
        const parsedDocx = await mammoth.extractRawText({ buffer });
        textContent = parsedDocx.value;
      } else {
        // Plain text fallback
        textContent = buffer.toString("utf-8");
      }

      const prompt = `You are a professional ATS Resume Parser. Here is the plain text of a candidate's resume:
---
${textContent}
---
Extract the following information:
1. Candidate Name (under key "name")
2. Email Address (under key "email")
3. Contact Number (under key "phone")
4. A clean list of skills/technologies mentioned in the resume (under key "skills" as an array of strings)
5. A brief summary of their professional experience (under key "summary" as a string)
6. Raw reconstructed text of the resume (under key "raw_text")

Respond ONLY with a JSON object matching this schema:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "summary": "string",
  "raw_text": "reconstructed plain text from the document"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      resumeJson = JSON.parse(responseText);
    }

    return NextResponse.json({ success: true, ...resumeJson });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    let msg = error?.message || "Failed to parse resume.";
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes("400 Bad Request")) {
      msg = "Invalid Google Gemini API Key. Please verify the GEMINI_API_KEY in your .env file.";
    }
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
