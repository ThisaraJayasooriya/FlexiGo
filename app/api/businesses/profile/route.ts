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

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Fetch business profile
    const { data, error } = await supabaseAdmin
      .from("business_profiles")
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

    const formData = await req.formData();
    const company_name = formData.get("company_name") as string;
    const description = formData.get("description") as string;
    const business_type = formData.get("business_type") as string | null;
    const location = formData.get("location") as string | null;
    const phone = formData.get("phone") as string | null;
    const website = formData.get("website") as string | null;
    const years_experience = formData.get("years_experience") ? Number(formData.get("years_experience")) : null;
    const social_links_raw = formData.get("social_links") as string | null;
    const social_links = social_links_raw ? JSON.parse(social_links_raw) : [];
    const logo = formData.get("logo") as File | null;

    let logo_url: string | null = null;

    // Upload new logo if provided
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
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }

      const { data } = supabaseAdmin.storage
        .from("business-logos")
        .getPublicUrl(filePath);

      logo_url = data.publicUrl;
    }

    // Update business profile
    const updateData: any = {
      company_name,
      description,
      business_type,
      location,
      phone,
      website,
      social_links,
      years_experience
    };

    if (logo_url) {
      updateData.logo_url = logo_url;
    }

    const { data, error } = await supabaseAdmin
      .from("business_profiles")
      .update(updateData)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Business profile updated",
      profile: data
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
