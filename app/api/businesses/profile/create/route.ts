import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { BusinessProfile } from "@/types/business";

export async function POST(req: Request) {
  try {
    const body: Omit<BusinessProfile, "user_id"> = await req.json();

    // TEMP: Mock user_id for testing
    const user_id = "4841a195-b35d-4416-aea5-e38cf5408e70";

    const { data, error } = await supabase
      .from("business_profiles")
      .upsert({
        user_id,
        ...body,
      })
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase
      .from("user_roles")
      .update({ first_login_complete: true })
      .eq("user_id", user_id);

    return NextResponse.json({ message: "Business profile completed", profile: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
