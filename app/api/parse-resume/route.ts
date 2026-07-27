import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientApiKey = request.headers.get("x-gemini-key");

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please configure it in Settings or .env.local." },
        { status: 400 }
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

      if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
        textContent = buffer.toString("utf-8");
      } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        const mammothResult = await mammoth.extractRawText({ buffer });
        textContent = mammothResult.value;
      } else {
        return NextResponse.json(
          { error: "Unsupported file format. Please upload PDF, DOCX, or TXT." },
          { status: 400 }
        );
      }

      if (!textContent.trim()) {
        return NextResponse.json({ error: "Extracted text content is empty." }, { status: 400 });
      }

      const prompt = `You are a professional ATS Resume Parser. Read and parse this resume plain text:
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
    return NextResponse.json(
      { error: error.message || "Failed to parse resume." },
      { status: 500 }
    );
  }
}
