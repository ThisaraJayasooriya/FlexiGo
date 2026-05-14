import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { workerProfiles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { WorkerProfile } from "@/types/worker";
import { createWorkerProfileSchema } from "@/lib/validators/workerSchemas";
import type { ZodIssue } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = createWorkerProfileSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err: ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;
    const d = validation.data;

    // Upsert worker profile using Drizzle
    const [profile] = await db
      .insert(workerProfiles)
      .values({
        user_id,
        name: d.name,
        phone: d.phone,
        skills: d.skills,
        availability: d.availability,
        city: d.city,
        district: d.district,
        latitude: d.latitude,
        longitude: d.longitude,
        formatted_address: d.formattedAddress || null,
      })
      .onConflictDoUpdate({
        target: workerProfiles.user_id,
        set: {
          name: d.name,
          phone: d.phone,
          skills: d.skills,
          availability: d.availability,
          city: d.city,
          district: d.district,
          latitude: d.latitude,
          longitude: d.longitude,
          formatted_address: d.formattedAddress || null,
        },
      })
      .returning();

    // Mark onboarding complete using Drizzle
    await db
      .update(userRoles)
      .set({ first_login_complete: true })
      .where(eq(userRoles.user_id, user_id));

    return NextResponse.json({ message: "Worker profile completed", profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
