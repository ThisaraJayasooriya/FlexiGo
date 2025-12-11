import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// small zod schema for validation
const applySchema = z.object({
  job_id: z.string().uuid()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }
    const { job_id, } = parsed.data;

    // get user from token
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const worker_id = userData.user.id;

    // Prevent applying to your own job (business cannot apply)
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("jobs")
      .select("business_id")
      .eq("id", job_id)
      .single();

    if (jobErr) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.business_id === worker_id) {
      return NextResponse.json({ error: "Businesses cannot apply to their own job" }, { status: 400 });
    }

    // Insert application — unique constraint on (job_id, worker_id) will block duplicates
    const { error: insertErr } = await supabaseAdmin.from("applications").insert({
      job_id,
      worker_id,
      status: "pending"
    });

    if (insertErr) {
      // unique violation handling
      if (insertErr.code === "23505") {
        return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 });
      }
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Application submitted" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
