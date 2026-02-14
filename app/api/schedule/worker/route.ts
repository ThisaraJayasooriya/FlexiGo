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

    const worker_id = userData.user.id;

    // Fetch only ACCEPTED applications with job details
    const { data: acceptedJobs, error: jobsError } = await supabaseAdmin
      .from("applications")
      .select(`
        id,
        applied_at,
        jobs (
          id,
          title,
          date,
          time,
          venue,
          pay_rate,
          working_hours,
          required_skills,
          number_of_workers,
          business_id
        )
      `)
      .eq("worker_id", worker_id)
      .eq("status", "accepted")
      .order("jobs(date)", { ascending: true });

    if (jobsError) {
      return NextResponse.json({ error: jobsError.message }, { status: 400 });
    }

    // Fetch business profiles
    const businessIds = acceptedJobs
      .map((app: any) => app.jobs?.business_id)
      .filter(Boolean);

    const { data: businesses, error: businessError } = await supabaseAdmin
      .from("business_profiles")
      .select("user_id, company_name, logo_url")
      .in("user_id", businessIds);

    if (businessError) {
      console.error("Error fetching businesses:", businessError);
    }

    const businessMap = new Map(
      businesses?.map(b => [b.user_id, b]) || []
    );

    // Format schedule data
    const schedules = acceptedJobs
      .filter((app: any) => app.jobs)
      .map((app: any) => ({
        id: app.id,
        job_id: app.jobs.id,
        title: app.jobs.title,
        date: app.jobs.date,
        time: app.jobs.time,
        venue: app.jobs.venue,
        pay_rate: app.jobs.pay_rate,
        working_hours: app.jobs.working_hours,
        required_skills: app.jobs.required_skills,
        number_of_workers: app.jobs.number_of_workers,
        business_name: businessMap.get(app.jobs.business_id)?.company_name || "Unknown Company",
        business_logo: businessMap.get(app.jobs.business_id)?.logo_url || null,
        applied_at: app.applied_at
      }));

    return NextResponse.json({ schedules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
