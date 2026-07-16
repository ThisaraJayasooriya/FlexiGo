import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/check
 * Returns the authenticated user's role, first_login_complete, and verification_status.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [data] = await db
      .select({
        role: userRoles.role,
        first_login_complete: userRoles.first_login_complete,
        verification_status: userRoles.verification_status, // needed by business dashboard + job-create guard
      })
      .from(userRoles)
      .where(eq(userRoles.user_id, userData.user.id));

    if (!data) return NextResponse.json({ error: "User role not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
