import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBusinessVerificationStatus } from "@/lib/businessVerification";
import { isBusinessVerified } from "@/lib/businessVerification.shared";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

/**
 * GET /api/jobs/[jobId]/acceptance-status
 * Returns accepted/pending/remaining staffing counts for a business-owned job.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  if (!jobId) {
    return NextResponse.json(
      { error: "Job ID is required" },
      { status: 400 }
    );
  }

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

    const verificationStatus = await getBusinessVerificationStatus(business_id);
    if (!isBusinessVerified(verificationStatus)) {
      return NextResponse.json({ error: "Business verification required" }, { status: 403 });
    }

    // Get the job and verify it belongs to this business
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, number_of_workers, business_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Verify the job belongs to this business
    if (job.business_id !== business_id) {
      return NextResponse.json(
        { error: "Unauthorized to access this job" },
        { status: 403 }
      );
    }

    // Count accepted applications for this job
    const { count, error: countError } = await supabaseAdmin
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("status", "accepted");

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 400 }
      );
    }

    const acceptedCount = count || 0;
    const requiredWorkers = job.number_of_workers;
    const canAcceptMore = acceptedCount < requiredWorkers;
    const remainingSlots = Math.max(0, requiredWorkers - acceptedCount);

    return NextResponse.json({
      jobId: job.id,
      requiredWorkers,
      acceptedCount,
      canAcceptMore,
      remainingSlots,
      isFullyStaffed: acceptedCount >= requiredWorkers
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
