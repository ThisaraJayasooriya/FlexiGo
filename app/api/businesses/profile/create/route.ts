import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // Authenticate user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Read form data
    const formData = await req.formData();

    const company_name = formData.get("company_name") as string;
    const description = formData.get("description") as string;
    const logo = formData.get("logo") as File | null;

    let logo_url: string | null = null;

    // Upload logo if provided
    if (logo) {
      const ext = logo.name.split(".").pop();
      const filePath = `logos/${user_id}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("business-logos")
        .upload(filePath, logo, {
          upsert: true,
          contentType: logo.type
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 400 }
        );
      }

      const { data } = supabaseAdmin.storage
        .from("business-logos")
        .getPublicUrl(filePath);

      logo_url = data.publicUrl;
    }

    // Upsert business profile
    const { data, error } = await supabaseAdmin
      .from("business_profiles")
      .upsert(
        {
          user_id,
          company_name,
          description,
          logo_url
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Mark onboarding complete
    await supabaseAdmin
      .from("user_roles")
      .update({ first_login_complete: true })
      .eq("user_id", user_id);

    return NextResponse.json({
      message: "Business profile completed",
      profile: data
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
