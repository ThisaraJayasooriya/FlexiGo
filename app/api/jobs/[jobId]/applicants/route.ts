import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { jobs, applications, workerProfiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getBusinessVerificationStatus } from "@/lib/businessVerification";
import { isBusinessVerified } from "@/lib/businessVerification.shared";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = userData.user.id;

    const verificationStatus = await getBusinessVerificationStatus(businessId);
    if (!isBusinessVerified(verificationStatus)) {
      return NextResponse.json({ error: "Business verification required" }, { status: 403 });
    }

    // Verify job ownership
    const [job] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.business_id, businessId)));

    if (!job) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }

    // Fetch applications with worker profiles in one join query
    const rows = await db
      .select({
        application_id: applications.id,
        status: applications.status,
        applied_at: applications.applied_at,
        worker_id: applications.worker_id,
        worker_name: workerProfiles.name,
        worker_skills: workerProfiles.skills,
        worker_availability: workerProfiles.availability,
        worker_phone: workerProfiles.phone,
      })
      .from(applications)
      .leftJoin(workerProfiles, eq(applications.worker_id, workerProfiles.user_id))
      .where(eq(applications.job_id, jobId))
      .orderBy(desc(applications.applied_at));

    // Shape into the expected response format
    const applicants = rows.map((row) => ({
      application_id: row.application_id,
      status: row.status,
      applied_at: row.applied_at,
      worker_id: row.worker_id,
      worker: row.worker_name
        ? {
            user_id: row.worker_id,
            name: row.worker_name,
            skills: row.worker_skills,
            availability: row.worker_availability,
            phone: row.worker_phone,
          }
        : null,
    }));

    return NextResponse.json({ applicants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
