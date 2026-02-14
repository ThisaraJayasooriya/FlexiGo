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

    const worker_id = userData.user.id;
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Verify the application belongs to this worker
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("applications")
      .select("id, status, worker_id")
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (application.worker_id !== worker_id) {
      return NextResponse.json(
        { error: "You can only withdraw your own applications" },
        { status: 403 }
      );
    }

    // Only allow withdrawal of pending applications
    if (application.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot withdraw ${application.status} application` },
        { status: 400 }
      );
    }

    // Update the application status to withdrawn
    const { error: updateError } = await supabaseAdmin
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: "Application withdrawn successfully" 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
