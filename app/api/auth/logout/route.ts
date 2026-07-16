import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/auth/logout
 * Signs out the current Supabase session.
 */
export async function POST(req: Request) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Logout successful" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
