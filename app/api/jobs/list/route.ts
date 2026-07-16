import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { jobs, applications, businessProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/jobs/list
 * Lists open jobs for workers, including whether the current worker already applied.
 */
export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worker_id = userData.user.id;

    // Fetch open jobs with business phone
    const openJobs = await db
      .select({
        id: jobs.id,
        business_id: jobs.business_id,
        title: jobs.title,
        date: jobs.date,
        time: jobs.time,
        working_hours: jobs.working_hours,
        venue: jobs.venue,
        pay_rate: jobs.pay_rate,
        required_skills: jobs.required_skills,
        number_of_workers: jobs.number_of_workers,
        status: jobs.status,
        created_at: jobs.created_at,
        business_profiles: {
          phone: businessProfiles.phone,
        },
      })
      .from(jobs)
      .leftJoin(businessProfiles, eq(jobs.business_id, businessProfiles.user_id))
      .where(eq(jobs.status, "open"))
      .orderBy(jobs.created_at);

    // Fetch this worker's application job IDs in one query
    const workerApps = await db
      .select({ job_id: applications.job_id })
      .from(applications)
      .where(eq(applications.worker_id, worker_id));

    const appliedJobIds = new Set(workerApps.map((a) => a.job_id));

    // Add has_applied flag
    const jobsWithAppliedFlag = openJobs.map((job) => ({
      ...job,
      has_applied: appliedJobIds.has(job.id),
    }));

    return NextResponse.json({ jobs: jobsWithAppliedFlag });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
