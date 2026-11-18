import { NextRequest, NextResponse } from "next/server";
import { generateBulletRewrites } from "@/lib/ml/atsModel";

export async function POST(request: NextRequest) {
  try {
    const { bullet, targetRole, keywords } = await request.json();

    if (!bullet || bullet.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a bullet point to optimize." },
        { status: 400 }
      );
    }

    // Generate Google XYZ formula bullet point rewrites
    const result = generateBulletRewrites(bullet, targetRole, keywords);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Bullet rewrite error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to rewrite bullet point." },
      { status: 500 }
    );
  }
}
