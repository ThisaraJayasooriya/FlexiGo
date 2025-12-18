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
    // 1 Authenticate
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

    // 2 Fetch applications for this business's jobs
    const { data, error } = await supabaseAdmin
      .from("applications")
      .select(`
        id,
        status,
        applied_at,

        jobs (
          id,
          title,
          date,
          venue,
          pay_rate,
          business_id
        ),

        worker_profiles (
          user_id,
          name,
          skills,
          availability
        )
      `)
      .eq("jobs.business_id", business_id)
      .order("applied_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ applications: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
