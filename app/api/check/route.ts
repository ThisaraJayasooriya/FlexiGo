import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role, first_login_complete")
      .eq("user_id", userData.user.id)
      .single(); // safe here, one row guaranteed

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
