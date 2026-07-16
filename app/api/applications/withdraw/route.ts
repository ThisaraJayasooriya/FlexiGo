import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PATCH /api/applications/withdraw
 * Worker withdraws their own pending application. Body: { applicationId }
 */
export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worker_id = userData.user.id;
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Fetch the application to verify ownership and status
    const [application] = await db
      .select({ id: applications.id, status: applications.status, worker_id: applications.worker_id })
      .from(applications)
      .where(eq(applications.id, applicationId));

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.worker_id !== worker_id) {
      return NextResponse.json({ error: "You can only withdraw your own applications" }, { status: 403 });
    }

    if (application.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot withdraw ${application.status} application` },
        { status: 400 }
      );
    }

    // Update status to withdrawn
    await db
      .update(applications)
      .set({ status: "withdrawn" })
      .where(eq(applications.id, applicationId));

    return NextResponse.json({ message: "Application withdrawn successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
