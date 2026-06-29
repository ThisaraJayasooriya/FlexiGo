import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { jobs, applications } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getBusinessVerificationStatus } from "@/lib/businessVerification";
import { isBusinessVerified } from "@/lib/businessVerification.shared";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    const verificationStatus = await getBusinessVerificationStatus(user_id);
    if (!isBusinessVerified(verificationStatus)) {
      return NextResponse.json({ error: "Business verification required to access jobs" }, { status: 403 });
    }

    // Fetch all jobs for this business
    const businessJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.business_id, user_id))
      .orderBy(jobs.created_at);

    if (!businessJobs.length) return NextResponse.json({ jobs: [] });

    // Fetch application counts in one query
    const jobIds = businessJobs.map((j) => j.id);
    const appRows = await db
      .select({ job_id: applications.job_id, status: applications.status })
      .from(applications)
      .where(inArray(applications.job_id, jobIds));

    // Build count maps
    const countMap = new Map<string, number>();
    const acceptedMap = new Map<string, number>();
    for (const app of appRows) {
      countMap.set(app.job_id, (countMap.get(app.job_id) || 0) + 1);
      if (app.status === "accepted") {
        acceptedMap.set(app.job_id, (acceptedMap.get(app.job_id) || 0) + 1);
      }
    }

    const jobsWithCounts = businessJobs.map((job) => ({
      ...job,
      application_count: countMap.get(job.id) || 0,
      accepted_count: acceptedMap.get(job.id) || 0,
    }));

    return NextResponse.json({ jobs: jobsWithCounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
