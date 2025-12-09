import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createJobSchema } from "@/lib/validators/jobSchemas";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid job data" }, { status: 400 });
    }

    // Read token from Authorization header
    const token = req.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user using service role client
    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Insert job while bypassing RLS
    const { error } = await supabaseAdmin.from("jobs").insert({
      business_id: user_id,
      title: parsed.data.title,
      date: parsed.data.date,
      time: parsed.data.time,
      venue: parsed.data.venue,
      pay_rate: parsed.data.payRate,
      required_skills: parsed.data.requiredSkills || [],
      number_of_workers: parsed.data.workerCount,
      status: "open" // Default status
    });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Job created successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
