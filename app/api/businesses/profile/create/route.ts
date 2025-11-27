import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { BusinessProfile } from "@/types/business";

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

export async function POST(req: Request) {
  try {
    const body: Omit<BusinessProfile, "user_id"> = await req.json();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Upsert business profile using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("business_profiles")
      .upsert({ user_id, ...body }, { onConflict: "user_id" })
      .select(); // returns array

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const profile = data?.[0] || null;

    // Update first_login_complete using admin client
    await supabaseAdmin
      .from("user_roles")
      .update({ first_login_complete: true })
      .eq("user_id", user_id);

    return NextResponse.json({ message: "Business profile completed", profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
