import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businessVerifications, businessProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/adminGuard";

/**
 * GET /api/admin/verifications
 * Lists verification submissions. Query: ?status=pending|approved|rejected (default pending).
 */
export async function GET(req: Request) {
  try {
    // Step 1: Confirm caller is an admin (uses shared guard)
    const guard = await verifyAdmin(req);
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Step 2: Read the ?status= query param (default = "pending")
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "pending";

    // Validate the status value
    if (!["pending", "approved", "rejected"].includes(statusFilter)) {
      return NextResponse.json(
        { error: "status must be one of: pending, approved, rejected" },
        { status: 400 }
      );
    }

    // Step 3: Query business_verifications filtered by status,
    //   LEFT JOIN business_profiles to get company_name and logo_url for display.
    //   Results ordered newest-first.
    const verifications = await db
      .select({
        // All columns from business_verifications
        id:                 businessVerifications.id,
        business_id:        businessVerifications.business_id,
        business_reg_type:  businessVerifications.business_reg_type,
        br_number:          businessVerifications.br_number,
        registered_name:    businessVerifications.registered_name,
        registered_address: businessVerifications.registered_address,
        owner_nic:          businessVerifications.owner_nic,
        certificate_url:    businessVerifications.certificate_url,
        additional_doc_url: businessVerifications.additional_doc_url,
        status:             businessVerifications.status,
        admin_note:         businessVerifications.admin_note,
        reviewed_by:        businessVerifications.reviewed_by,
        reviewed_at:        businessVerifications.reviewed_at,
        submitted_at:       businessVerifications.submitted_at,
        // From the joined business_profiles — these are the profile values the business filled in
        company_name:       businessProfiles.company_name,
        logo_url:           businessProfiles.logo_url,
      })
      .from(businessVerifications)
      .leftJoin(businessProfiles, eq(businessVerifications.business_id, businessProfiles.user_id))
      .where(eq(businessVerifications.status, statusFilter))
      .orderBy(desc(businessVerifications.submitted_at));

    return NextResponse.json({ verifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
