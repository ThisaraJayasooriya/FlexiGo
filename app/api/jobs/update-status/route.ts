import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { jobs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type JobStatus = "open" | "closed" | "cancelled" | "filled";

/**
 * PATCH /api/jobs/update-status
 * Business updates one of their jobs' status. Body: { job_id, status }
 */
export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;
    const body = await req.json();
    const { job_id, status } = body;

    const validStatuses: JobStatus[] = ["open", "closed", "cancelled", "filled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: open, closed, cancelled, or filled" },
        { status: 400 }
      );
    }

    if (!job_id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Verify job ownership and update in one query using and()
    const [updatedJob] = await db
      .update(jobs)
      .set({ status })
      .where(and(eq(jobs.id, job_id), eq(jobs.business_id, user_id)))
      .returning({ id: jobs.id });

    if (!updatedJob) {
      return NextResponse.json(
        { error: "Job not found or you can only update your own jobs" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Job status updated successfully", status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
