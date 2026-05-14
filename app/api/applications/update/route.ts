import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { applications, jobs } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business_id = userData.user.id;
    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Application ID and status are required" }, { status: 400 });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'" }, { status: 400 });
    }

    // Fetch application and join job to verify business ownership
    const [app] = await db
      .select({
        id: applications.id,
        job_id: applications.job_id,
        business_id: jobs.business_id,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.job_id, jobs.id))
      .where(eq(applications.id, applicationId));

    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (app.business_id !== business_id) {
      return NextResponse.json({ error: "Unauthorized to update this application" }, { status: 403 });
    }

    // If accepting, enforce worker limit
    if (status === "accepted") {
      const [job] = await db
        .select({ number_of_workers: jobs.number_of_workers })
        .from(jobs)
        .where(eq(jobs.id, app.job_id));

      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const [{ value: currentlyAccepted }] = await db
        .select({ value: count() })
        .from(applications)
        .where(and(eq(applications.job_id, app.job_id), eq(applications.status, "accepted")));

      if (currentlyAccepted >= job.number_of_workers) {
        return NextResponse.json(
          {
            error: "Cannot accept more workers",
            message: `You have already accepted ${currentlyAccepted} out of ${job.number_of_workers} required workers.`,
            acceptedCount: currentlyAccepted,
            requiredWorkers: job.number_of_workers,
          },
          { status: 400 }
        );
      }
    }

    // Update application status
    const [updated] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, applicationId))
      .returning();

    // If accepted, include staffing info
    if (status === "accepted") {
      const [job] = await db
        .select({ number_of_workers: jobs.number_of_workers })
        .from(jobs)
        .where(eq(jobs.id, app.job_id));

      const [{ value: acceptedCount }] = await db
        .select({ value: count() })
        .from(applications)
        .where(and(eq(applications.job_id, app.job_id), eq(applications.status, "accepted")));

      const requiredWorkers = job?.number_of_workers || 0;
      const remainingSlots = Math.max(0, requiredWorkers - acceptedCount);

      return NextResponse.json({
        application: updated,
        staffingInfo: {
          acceptedCount,
          requiredWorkers,
          remainingSlots,
          isFullyStaffed: acceptedCount >= requiredWorkers,
        },
      });
    }

    return NextResponse.json({ application: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
