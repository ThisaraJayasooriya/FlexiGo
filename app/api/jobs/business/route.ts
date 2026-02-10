import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user_id = userData.user.id;

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("business_id", user_id)
      .order("created_at", { ascending: false });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    // Fetch application counts for all jobs
    const jobIds = data.map(job => job.id);
    
    const { data: applicationCounts, error: countError } = await supabaseAdmin
      .from("applications")
      .select("job_id")
      .in("job_id", jobIds);

    if (countError) {
      console.error("Error fetching application counts:", countError);
    }

    // Create a map of job_id to application count
    const countMap = new Map<string, number>();
    if (applicationCounts) {
      applicationCounts.forEach(app => {
        countMap.set(app.job_id, (countMap.get(app.job_id) || 0) + 1);
      });
    }

    // Add application_count to each job
    const jobsWithCounts = data.map(job => ({
      ...job,
      application_count: countMap.get(job.id) || 0
    }));

    return NextResponse.json({ jobs: jobsWithCounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
