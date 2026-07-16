import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businessVerifications, userRoles, jobs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAdmin } from "@/lib/adminGuard";

/**
 * GET /api/admin/stats
 * Admin dashboard counts: verifications, workers, and jobs.
 */
export async function GET(req: Request) {
  try {
    // Verify admin access
    const guard = await verifyAdmin(req);
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Run all count queries in parallel for performance
    const [
      pendingResult,
      approvedResult,
      rejectedResult,
      workersResult,
      jobsResult,
    ] = await Promise.all([
      // Count pending verification submissions
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(businessVerifications)
        .where(eq(businessVerifications.status, "pending")),

      // Count businesses with approved verification_status in user_roles
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(userRoles)
        .where(eq(userRoles.verification_status, "approved")),

      // Count rejected verification submissions (total, not unique businesses)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(businessVerifications)
        .where(eq(businessVerifications.status, "rejected")),

      // Count total worker accounts
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(userRoles)
        .where(eq(userRoles.role, "worker")),

      // Count total jobs ever created
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs),
    ]);

    return NextResponse.json({
      pending_verifications:  pendingResult[0]?.count  ?? 0,
      approved_businesses:    approvedResult[0]?.count  ?? 0,
      rejected_verifications: rejectedResult[0]?.count ?? 0,
      total_workers:          workersResult[0]?.count   ?? 0,
      total_jobs:             jobsResult[0]?.count       ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
