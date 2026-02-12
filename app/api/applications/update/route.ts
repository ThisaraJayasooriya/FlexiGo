import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business_id = userData.user.id;
    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400 }
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Verify the application belongs to this business
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("applications")
      .select("id, job_id, jobs(business_id)")
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Type assertion for the nested jobs object
    const jobs = application.jobs as any;
    if (!jobs || jobs.business_id !== business_id) {
      return NextResponse.json(
        { error: "Unauthorized to update this application" },
        { status: 403 }
      );
    }

    // If accepting an application, check if we've reached the worker limit
    if (status === "accepted") {
      // Get the job details
      const { data: job, error: jobError } = await supabaseAdmin
        .from("jobs")
        .select("id, number_of_workers")
        .eq("id", application.job_id)
        .single();

      if (jobError || !job) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }

      // Count currently accepted applications
      const { count, error: countError } = await supabaseAdmin
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("job_id", application.job_id)
        .eq("status", "accepted");

      if (countError) {
        return NextResponse.json(
          { error: countError.message },
          { status: 400 }
        );
      }

      const currentlyAccepted = count || 0;

      // Check if accepting this application would exceed the limit
      if (currentlyAccepted >= job.number_of_workers) {
        return NextResponse.json(
          {
            error: "Cannot accept more workers",
            message: `You have already accepted ${currentlyAccepted} out of ${job.number_of_workers} required workers for this job. You cannot accept more applications.`,
            acceptedCount: currentlyAccepted,
            requiredWorkers: job.number_of_workers
          },
          { status: 400 }
        );
      }
    }

    // Update the application status
    const { data, error } = await supabaseAdmin
      .from("applications")
      .update({ status })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If we just accepted an application, include staffing info in response
    if (status === "accepted") {
      const { data: job } = await supabaseAdmin
        .from("jobs")
        .select("number_of_workers")
        .eq("id", application.job_id)
        .single();

      const { count } = await supabaseAdmin
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("job_id", application.job_id)
        .eq("status", "accepted");

      const acceptedCount = count || 0;
      const requiredWorkers = job?.number_of_workers || 0;
      const remainingSlots = Math.max(0, requiredWorkers - acceptedCount);

      return NextResponse.json({ 
        application: data,
        staffingInfo: {
          acceptedCount,
          requiredWorkers,
          remainingSlots,
          isFullyStaffed: acceptedCount >= requiredWorkers
        }
      });
    }

    return NextResponse.json({ application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
