import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { applications, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const applySchema = z.object({ job_id: z.string().uuid() });

/**
 * POST /api/applications/apply
 * Worker applies to a job. Body: { job_id }. Rejects own-job and duplicate applies.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }
    const { job_id } = parsed.data;

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const worker_id = userData.user.id;

    // Prevent business applying to their own job
    const [job] = await db.select({ business_id: jobs.business_id }).from(jobs).where(eq(jobs.id, job_id));
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.business_id === worker_id) {
      return NextResponse.json({ error: "Businesses cannot apply to their own job" }, { status: 400 });
    }

    // Insert — unique constraint on (job_id, worker_id) blocks duplicates
    try {
      await db.insert(applications).values({ job_id, worker_id, status: "pending" });
    } catch (insertErr: any) {
      // Postgres unique violation error code
      if (insertErr.code === "23505") {
        return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 });
      }
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Application submitted" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
