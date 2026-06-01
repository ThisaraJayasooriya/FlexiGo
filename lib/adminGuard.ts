// lib/adminGuard.ts
//
// PURPOSE: A reusable helper function that every admin API route calls first.
//   It verifies the JWT token from the Authorization header, then checks that
//   the user's role in user_roles is "admin". If either check fails it returns
//   an error object; the route handler must then return an HTTP error response.
//
// USAGE in an API route:
//   const guard = await verifyAdmin(req);
//   if (!guard.success) return NextResponse.json({ error: guard.error }, { status: guard.status });
//   const adminId = guard.user.id;  // safe — TypeScript knows user is defined here

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

// Two clearly discriminated shapes — TypeScript narrows these perfectly on `if (!guard.success)`
type AdminGuardResult =
  | { success: false; error: string; status: 401 | 403 }
  | { success: true;  user: { id: string; email?: string } };


export async function verifyAdmin(req: Request): Promise<AdminGuardResult> {
  // Step 1: Extract Bearer token from Authorization header
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return { success: false, error: "Unauthorized — no token provided", status: 401 };
  }

  // Step 2: Validate the token with Supabase Auth
  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData.user) {
    return { success: false, error: "Unauthorized — invalid or expired token", status: 401 };
  }

  // Step 3: Check that the user's role in our user_roles table is "admin"
  const [roleRow] = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.user_id, userData.user.id));

  if (!roleRow || roleRow.role !== "admin") {
    return { success: false, error: "Forbidden — admin access required", status: 403 };
  }

  // All checks passed — return the authenticated admin user
  return { success: true, user: { id: userData.user.id, email: userData.user.email } };
}
