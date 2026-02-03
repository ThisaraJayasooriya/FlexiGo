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
    //  Get worker from token
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worker_id = userData.user.id;

    //  Fetch jobs + applications by this worker
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select(`
        id,
        title,
        date,
        time,
        working_hours,
        venue,
        pay_rate,
        required_skills,
        number_of_workers,
        status,
        created_at,
        applications (
          id
        )
      `)
      .eq("status", "open")
      .eq("applications.worker_id", worker_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    //  Add has_applied flag
    const jobsWithAppliedFlag = data.map((job: any) => ({
      ...job,
      has_applied: job.applications.length > 0,
      applications: undefined // remove raw applications array
    }));

    return NextResponse.json({ jobs: jobsWithAppliedFlag });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
