import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { userRoles } from "@/db/schema";
import { registerSchema } from "@/lib/validators/authSchemas";

/**
 * POST /api/auth/register
 * Creates a Supabase user and inserts a `user_roles` row.
 * Body: { email, password, role: "worker" | "business" }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body; // role: "worker" | "business"

    // Validate input using Zod schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => err.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Insert into user_roles using Drizzle
    if (data.user) {
      try {
        await db.insert(userRoles).values({
          user_id: data.user.id,
          role,
          first_login_complete: false,
          // Businesses start as "unverified" — must go through admin review before posting jobs.
          // Workers and admins get null (not applicable to them).
          verification_status: role === "business" ? "unverified" : null,
        });
      } catch (roleError: any) {
        console.error("Failed to create user role:", roleError);
        return NextResponse.json(
          { error: "Failed to create user role: " + roleError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "User registered successfully", user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
