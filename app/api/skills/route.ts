// app/api/skills/route.ts
import { NextResponse } from "next/server";
import { SKILL_CATEGORIES, validateSkills } from "@/lib/skills/skillCategories";

/**
 * GET /api/skills
 * Returns all skill categories and skills for frontend selection
 */
export async function GET() {
  try {
    return NextResponse.json({
      categories: SKILL_CATEGORIES,
      message: "Skills retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve skills" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills/validate
 * Validates an array of skills against the predefined list
 * Body: { skills: string[] }
 */
export async function POST(req: Request) {
  try {
    const { skills } = await req.json();

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: "Skills must be provided as an array" },
        { status: 400 }
      );
    }

    const validation = validateSkills(skills);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          isValid: false,
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid: true,
      message: "Skills are valid",
      count: skills.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to validate skills" },
      { status: 500 }
    );
  }
}
