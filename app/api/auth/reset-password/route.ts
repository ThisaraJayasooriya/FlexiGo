import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const { password, access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Set the session with the access token
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: access_token, // In password reset flow, we only have access token
    });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }

    // Update the user's password
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Password updated successfully", data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
