// app/api/verification/status/route.ts
//
// PURPOSE: Returns the current verification status for the authenticated business.
//   The frontend dashboard calls this to:
//   - Show the correct banner (unverified / pending / approved / rejected)
//   - Display the admin_note when rejected so the business knows why
//   - Show summary of the latest submitted documents
//
// RETURNS:
//   {
//     verification_status: "unverified" | "pending" | "approved" | "rejected" | null,
//     latest_submission: { ... } | null   // the most recent business_verifications row
//   }

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { businessVerifications, userRoles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Get the current verification_status from user_roles (the "quick" status)
    const [roleRow] = await db
      .select({ verification_status: userRoles.verification_status })
      .from(userRoles)
      .where(eq(userRoles.user_id, user_id));

    // Get the most recent submission from business_verifications (if any)
    // We use desc(submitted_at) so the first result is the latest submission
    const [latestSubmission] = await db
      .select()
      .from(businessVerifications)
      .where(eq(businessVerifications.business_id, user_id))
      .orderBy(desc(businessVerifications.submitted_at))
      .limit(1);

    return NextResponse.json({
      verification_status: roleRow?.verification_status ?? null,
      latest_submission: latestSubmission ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
