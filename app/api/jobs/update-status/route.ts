import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

type JobStatus = "open" | "closed" | "cancelled" | "filled";

export async function PATCH(req: Request) {
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
    const body = await req.json();
    const { job_id, status } = body;

    // Validate status
    const validStatuses: JobStatus[] = ["open", "closed", "cancelled", "filled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: open, closed, cancelled, or filled" },
        { status: 400 }
      );
    }

    if (!job_id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Verify the job belongs to this business
    const { data: job, error: fetchError } = await supabaseAdmin
      .from("jobs")
      .select("business_id")
      .eq("id", job_id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.business_id !== user_id) {
      return NextResponse.json(
        { error: "You can only update your own jobs" },
        { status: 403 }
      );
    }

    // Update job status
    const { error: updateError } = await supabaseAdmin
      .from("jobs")
      .update({ status })
      .eq("id", job_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Job status updated successfully",
      status
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
