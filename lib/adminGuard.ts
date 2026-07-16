import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Discriminated result so callers can narrow with `if (!guard.success)`. */
type AdminGuardResult =
  | { success: false; error: string; status: 401 | 403 }
  | { success: true; user: { id: string; email?: string } };

/**
 * Verifies the request Bearer token and ensures the user has role `"admin"`.
 * Call at the start of every admin API route.
 *
 * @example
 * const guard = await verifyAdmin(req);
 * if (!guard.success) {
 *   return NextResponse.json({ error: guard.error }, { status: guard.status });
 * }
 */
export async function verifyAdmin(req: Request): Promise<AdminGuardResult> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return { success: false, error: "Unauthorized — no token provided", status: 401 };
  }

  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData.user) {
    return { success: false, error: "Unauthorized — invalid or expired token", status: 401 };
  }

  const [roleRow] = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.user_id, userData.user.id));

  if (!roleRow || roleRow.role !== "admin") {
    return { success: false, error: "Forbidden — admin access required", status: 403 };
  }

  return { success: true, user: { id: userData.user.id, email: userData.user.email } };
}
