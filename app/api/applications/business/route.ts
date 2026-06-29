import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { applications, jobs, workerProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getBusinessVerificationStatus } from "@/lib/businessVerification";
import { isBusinessVerified } from "@/lib/businessVerification.shared";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business_id = userData.user.id;

    const verificationStatus = await getBusinessVerificationStatus(business_id);
    if (!isBusinessVerified(verificationStatus)) {
      return NextResponse.json({ error: "Business verification required to access applications" }, { status: 403 });
    }

    // Fetch all applications for this business's jobs via a join
    const rows = await db
      .select({
        id: applications.id,
        status: applications.status,
        applied_at: applications.applied_at,
        job_id: jobs.id,
        job_title: jobs.title,
        job_date: jobs.date,
        job_venue: jobs.venue,
        job_pay_rate: jobs.pay_rate,
        job_business_id: jobs.business_id,
        worker_user_id: workerProfiles.user_id,
        worker_name: workerProfiles.name,
        worker_skills: workerProfiles.skills,
        worker_availability: workerProfiles.availability,
        worker_phone: workerProfiles.phone,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.job_id, jobs.id))
      .leftJoin(workerProfiles, eq(applications.worker_id, workerProfiles.user_id))
      .where(eq(jobs.business_id, business_id))
      .orderBy(desc(applications.applied_at));

    // Shape into the format the frontend expects
    const result = rows.map((row) => ({
      id: row.id,
      status: row.status,
      applied_at: row.applied_at,
      jobs: {
        id: row.job_id,
        title: row.job_title,
        date: row.job_date,
        venue: row.job_venue,
        pay_rate: row.job_pay_rate,
        business_id: row.job_business_id,
      },
      worker_profiles: row.worker_user_id
        ? {
            user_id: row.worker_user_id,
            name: row.worker_name,
            skills: row.worker_skills,
            availability: row.worker_availability,
            phone: row.worker_phone,
          }
        : null,
    }));

    return NextResponse.json({ applications: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
