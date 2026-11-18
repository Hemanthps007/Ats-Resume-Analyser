import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractTextFromPdfBuffer } from "@/lib/pdfParser";
import { parseResumeText } from "@/lib/ml/resumeParser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "";
    const fileName = file.name || "";

    let textContent = "";

    // 1. PDF Documents
    if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      textContent = extractTextFromPdfBuffer(buffer);
      if (!textContent || textContent.trim().length < 10) {
        // Fallback: extract visible ASCII/UTF-8 strings from binary buffer
        textContent = buffer
          .toString("binary")
          .replace(/[^\x20-\x7E\r\n\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } 
    // 2. Word (.docx) Documents
    else if (
      mimeType.includes("wordprocessingml") ||
      fileName.toLowerCase().endsWith(".docx")
    ) {
      const parsedDocx = await mammoth.extractRawText({ buffer });
      textContent = parsedDocx.value;
    } 
    // 3. Plain Text Fallback
    else {
      textContent = buffer.toString("utf-8");
    }

    if (!textContent || textContent.trim().length < 10) {
      return NextResponse.json(
        { error: "Could not extract readable text from this file. Please verify the document is not password-protected or empty." },
        { status: 422 }
      );
    }

    // Parse structured resume metadata using local NLP/ML extractor
    const resumeJson = parseResumeText(textContent);

    return NextResponse.json({ success: true, ...resumeJson });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process resume." },
      { status: 500 }
    );
  }
}
