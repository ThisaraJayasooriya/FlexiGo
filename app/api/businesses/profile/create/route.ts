import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { businessProfiles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/businesses/profile/create
 * Creates the initial business profile and marks first_login_complete.
 */
export async function POST(req: Request) {
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
    const years_experience = formData.get("years_experience")
      ? Number(formData.get("years_experience"))
      : null;
    const social_links_raw = formData.get("social_links") as string | null;
    const social_links = social_links_raw ? JSON.parse(social_links_raw) : [];
    const logo = formData.get("logo") as File | null;

    let logo_url: string | null = null;

    // Upload logo — Supabase Storage stays
    if (logo) {
      const ext = logo.name.split(".").pop();
      const filePath = `logos/${user_id}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("business-logos")
        .upload(filePath, logo, { upsert: true, contentType: logo.type });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }

      const { data } = supabaseAdmin.storage.from("business-logos").getPublicUrl(filePath);
      logo_url = data.publicUrl;
    }

    // Upsert business profile using Drizzle
    const [profile] = await db
      .insert(businessProfiles)
      .values({ user_id, company_name, description, logo_url, business_type, location, phone, website, social_links, years_experience })
      .onConflictDoUpdate({
        target: businessProfiles.user_id,
        set: {
          company_name, description, business_type, location, phone, website, social_links, years_experience,
          ...(logo_url && { logo_url }),
        },
      })
      .returning();

    // Mark onboarding complete
    await db.update(userRoles).set({ first_login_complete: true }).where(eq(userRoles.user_id, user_id));

    return NextResponse.json({ message: "Business profile completed", profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
