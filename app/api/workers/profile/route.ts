import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateWorkerProfileSchema } from "@/lib/validators/workerSchemas";
import type { ZodIssue } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Fetch worker profile
    const { data, error } = await supabaseAdmin
      .from("worker_profiles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If no profile exists, return null profile with email
    return NextResponse.json({
      profile: data || null,
      email: userData.user.email
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

    // Validate request body against schema (partial updates allowed)
    const validation = updateWorkerProfileSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err: ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Update worker profile with validated data
    const { data, error } = await supabaseAdmin
      .from("worker_profiles")
      .update(validation.data)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Worker profile updated",
      profile: data
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
