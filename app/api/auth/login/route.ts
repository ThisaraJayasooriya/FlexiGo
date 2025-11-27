import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Login successful", session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
