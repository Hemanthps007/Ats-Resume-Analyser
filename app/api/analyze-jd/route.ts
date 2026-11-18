import { NextRequest, NextResponse } from "next/server";
import { analyzeJobDescriptionWithML } from "@/lib/ml/atsModel";

export async function POST(request: NextRequest) {
  try {
    const { jdText, resumeText } = await request.json();

    if (!jdText || jdText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid job description (at least 20 characters)." },
        { status: 400 }
      );
    }

    // Compute alignment and gap report using trained ML ATS prediction model
    const analysis = analyzeJobDescriptionWithML(jdText, resumeText || "");

    return NextResponse.json({ success: true, ...analysis });
  } catch (error: any) {
    console.error("JD Analysis error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze Job Description." },
      { status: 500 }
    );
  }
}
