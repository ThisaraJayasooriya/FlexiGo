import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { applications, jobs, businessProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worker_id = userData.user.id;

    // Single query: applications → jobs → businessProfiles
    const rows = await db
      .select({
        app_id: applications.id,
        status: applications.status,
        applied_at: applications.applied_at,
        job_id: jobs.id,
        job_title: jobs.title,
        job_date: jobs.date,
        job_time: jobs.time,
        job_venue: jobs.venue,
        job_pay_rate: jobs.pay_rate,
        job_working_hours: jobs.working_hours,
        job_required_skills: jobs.required_skills,
        job_number_of_workers: jobs.number_of_workers,
        business_name: businessProfiles.company_name,
        business_logo: businessProfiles.logo_url,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.job_id, jobs.id))
      .leftJoin(businessProfiles, eq(jobs.business_id, businessProfiles.user_id))
      .where(eq(applications.worker_id, worker_id))
      .orderBy(desc(applications.applied_at));

    // Shape into the format the frontend expects
    const formattedApplications = rows.map((row) => ({
      id: row.app_id,
      status: row.status,
      applied_at: row.applied_at,
      job: {
        id: row.job_id,
        title: row.job_title,
        date: row.job_date,
        time: row.job_time,
        venue: row.job_venue,
        pay_rate: row.job_pay_rate,
        working_hours: row.job_working_hours,
        required_skills: row.job_required_skills,
        number_of_workers: row.job_number_of_workers,
        business_name: row.business_name || "Unknown Company",
        business_logo: row.business_logo || null,
      },
    }));

    return NextResponse.json({ applications: formattedApplications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
