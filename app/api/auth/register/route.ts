import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// Create admin client for bypassing RLS
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
    const body = await req.json();
    const { email, password, role } = body; // role: "worker" | "business"

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role } // save role in auth.user_metadata
      },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Insert into user_roles table using admin client to bypass RLS
    if (data.user) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: data.user.id,
          role: role,
          first_login_complete: false
        });

      if (roleError) {
        console.error("Failed to create user role:", roleError);
        return NextResponse.json({ error: "Failed to create user role: " + roleError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "User registered successfully", user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
