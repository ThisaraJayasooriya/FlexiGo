import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;
  
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  try {

    // -------- AUTH --------
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = userData.user.id;

    // -------- VERIFY JOB OWNSERSHIP --------
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("jobs")
      .select("id")
      .eq("id", jobId)
      .eq("business_id", businessId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }

    // -------- FETCH APPLICATIONS --------
    const { data: apps, error: appsErr } = await supabaseAdmin
      .from("applications")
      .select("id, status, applied_at, worker_id")
      .eq("job_id", jobId)
      .order("applied_at", { ascending: false });

    if (appsErr) {
      return NextResponse.json({ error: appsErr.message }, { status: 500 });
    }

    // -------- FETCH ALL WORKER PROFILES IN ONE QUERY --------
    const workerIds = apps.map(a => a.worker_id);

    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("worker_profiles")
      .select("user_id, name, skills, availability")
      .in("user_id", workerIds);

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Convert profile list → map for faster lookup
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    // -------- MERGE APPLICATIONS + PROFILES --------
    const applicants = apps.map(app => ({
      application_id: app.id,
      status: app.status,
      applied_at: app.applied_at,
      worker_id: app.worker_id,
      worker: profileMap.get(app.worker_id) || null
    }));

    return NextResponse.json({ applicants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
