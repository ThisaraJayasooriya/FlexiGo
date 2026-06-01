// app/api/verification/submit/route.ts
//
// PURPOSE: Business submits their verification documents here.
//
// PROCESS:
//  1. Authenticate the user (must be a business account)
//  2. Validate text fields with Zod
//  3. Upload the certificate PDF/image to Supabase Storage (bucket: "verification-documents")
//  4. Optionally upload a second document
//  5. Insert a new row into business_verifications (status = "pending")
//  6. Update user_roles.verification_status to "pending"
//  7. Respond with success
//
// REQUEST: multipart/form-data with fields:
//   - business_reg_type  (string)
//   - br_number          (string)
//   - registered_name    (string)
//   - registered_address (string, optional)
//   - owner_nic          (string, optional)
//   - certificate        (File, required — PDF or image)
//   - additional_doc     (File, optional)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { businessVerifications, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verificationSubmitSchema } from "@/lib/validators/verificationSchemas";

export async function POST(req: Request) {
  try {
    // --- Step 1: Authenticate ---
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;

    // Confirm the user is actually a business account
    const [roleRow] = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.user_id, user_id));

    if (!roleRow || roleRow.role !== "business") {
      return NextResponse.json({ error: "Only business accounts can submit verification" }, { status: 403 });
    }

    // --- Step 2: Parse multipart form data ---
    const formData = await req.formData();

    const business_reg_type = (formData.get("business_reg_type") as string)?.trim();
    const br_number         = (formData.get("br_number") as string)?.trim();
    const registered_name   = (formData.get("registered_name") as string)?.trim();
    const registered_address = (formData.get("registered_address") as string | null)?.trim();
    const owner_nic         = (formData.get("owner_nic") as string | null)?.trim();
    const certificate       = formData.get("certificate") as File | null;
    const additional_doc    = formData.get("additional_doc") as File | null;

    // --- Step 3: Validate text fields with Zod ---
    const validation = verificationSubmitSchema.safeParse({
      business_reg_type,
      br_number,
      registered_name,
      registered_address: registered_address || undefined,
      owner_nic: owner_nic || undefined,
    });

    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    // --- Step 4: Certificate is required ---
    if (!certificate) {
      return NextResponse.json({ error: "Business Registration Certificate is required" }, { status: 400 });
    }

    // --- Step 5: Upload certificate to Supabase Storage ---
    // Path pattern: certificates/{user_id}/{timestamp}.{ext}
    // "upsert: false" means a new file is created on each submission, not overwritten.
    // This preserves history if a business re-submits.
    const certExt  = certificate.name.split(".").pop();
    const certPath = `certificates/${user_id}/${Date.now()}.${certExt}`;

    const { error: certUploadError } = await supabaseAdmin.storage
      .from("verification-documents")
      .upload(certPath, certificate, { upsert: false, contentType: certificate.type });

    if (certUploadError) {
      return NextResponse.json({ error: "Failed to upload certificate: " + certUploadError.message }, { status: 500 });
    }

    const { data: certUrlData } = supabaseAdmin.storage
      .from("verification-documents")
      .getPublicUrl(certPath);

    const certificate_url = certUrlData.publicUrl;

    // --- Step 6: Upload optional additional document ---
    let additional_doc_url: string | null = null;

    if (additional_doc) {
      const addExt  = additional_doc.name.split(".").pop();
      const addPath = `additional/${user_id}/${Date.now()}.${addExt}`;

      const { error: addUploadError } = await supabaseAdmin.storage
        .from("verification-documents")
        .upload(addPath, additional_doc, { upsert: false, contentType: additional_doc.type });

      if (!addUploadError) {
        const { data: addUrlData } = supabaseAdmin.storage
          .from("verification-documents")
          .getPublicUrl(addPath);
        additional_doc_url = addUrlData.publicUrl;
      }
    }

    // --- Step 7: Insert verification row (status defaults to "pending") ---
    const [newVerification] = await db
      .insert(businessVerifications)
      .values({
        business_id:        user_id,
        business_reg_type:  validation.data.business_reg_type,
        br_number:          validation.data.br_number,
        registered_name:    validation.data.registered_name,
        registered_address: validation.data.registered_address ?? null,
        owner_nic:          validation.data.owner_nic ?? null,
        certificate_url,
        additional_doc_url,
        status: "pending",
      })
      .returning();

    // --- Step 8: Update user_roles.verification_status to "pending" ---
    await db
      .update(userRoles)
      .set({ verification_status: "pending" })
      .where(eq(userRoles.user_id, user_id));

    return NextResponse.json({
      message: "Verification submitted successfully. An admin will review your documents.",
      verification: newVerification,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
