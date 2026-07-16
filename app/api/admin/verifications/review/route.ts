import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businessVerifications, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/adminGuard";

/**
 * POST /api/admin/verifications/review
 * Approves or rejects a verification and syncs `user_roles.verification_status`.
 * Body: { verification_id, decision: "approved" | "rejected", admin_note? }
 */
export async function POST(req: Request) {
  try {
    // Step 1: Verify admin
    const guard = await verifyAdmin(req);
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const adminId = guard.user.id; // TypeScript now knows guard.user is defined

    // Step 2: Parse and validate body
    const body = await req.json();
    const { verification_id, decision, admin_note } = body;

    if (!verification_id) {
      return NextResponse.json({ error: "verification_id is required" }, { status: 400 });
    }
    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "decision must be 'approved' or 'rejected'" }, { status: 400 });
    }

    // Step 3: Find the verification row to get business_id
    const [existing] = await db
      .select({ business_id: businessVerifications.business_id, status: businessVerifications.status })
      .from(businessVerifications)
      .where(eq(businessVerifications.id, verification_id));

    if (!existing) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Prevent reviewing an already-reviewed submission
    // (admin must re-check the list to avoid double-processing)
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: `This verification has already been ${existing.status}` },
        { status: 409 }
      );
    }

    // Step 4: Update the business_verifications row
    const [updatedVerification] = await db
      .update(businessVerifications)
      .set({
        status:      decision,              // "approved" or "rejected"
        admin_note:  admin_note || null,    // optional message for the business
        reviewed_by: adminId,              // which admin made the decision
        reviewed_at: new Date(),           // timestamp of the decision
      })
      .where(eq(businessVerifications.id, verification_id))
      .returning();

    // Step 5: Mirror the decision into user_roles.verification_status
    // This is what the frontend and job-create API guard actually check.
    await db
      .update(userRoles)
      .set({ verification_status: decision }) // "approved" or "rejected"
      .where(eq(userRoles.user_id, existing.business_id));

    return NextResponse.json({
      message: `Business verification ${decision} successfully.`,
      verification: updatedVerification,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
