import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { workerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateWorkerProfileSchema } from "@/lib/validators/workerSchemas";
import type { ZodIssue } from "zod";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.user_id, userData.user.id));

    return NextResponse.json({
      profile: profile || null,
      email: userData.user.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;
    const body = await req.json();

    const validation = updateWorkerProfileSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err: ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // Map camelCase formattedAddress → snake_case formatted_address for DB
    const { formattedAddress, ...rest } = validation.data as any;
    const updateData: any = { ...rest };
    if (formattedAddress !== undefined) updateData.formatted_address = formattedAddress;

    const [profile] = await db
      .update(workerProfiles)
      .set(updateData)
      .where(eq(workerProfiles.user_id, user_id))
      .returning();

    return NextResponse.json({ message: "Worker profile updated", profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
