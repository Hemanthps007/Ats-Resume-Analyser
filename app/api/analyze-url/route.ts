import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { analyzeJobDescriptionWithML } from "@/lib/ml/atsModel";

export async function POST(request: NextRequest) {
  try {
    const { url, resumeText } = await request.json();

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
        next: { revalidate: 60 },
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
      .slice(0, 10000);

    if (cleanText.length < 30) {
      return NextResponse.json(
        { error: "Could not extract readable job description text from this URL." },
        { status: 422 }
      );
    }

    // Evaluate alignment and gaps using trained ML ATS prediction model
    const gapAnalysis = analyzeJobDescriptionWithML(cleanText, resumeText || "");

    return NextResponse.json({ success: true, ...gapAnalysis });
  } catch (error: any) {
    console.error("URL Analysis error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze URL." },
      { status: 500 }
    );
  }
}
