import { db } from "@/lib/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Looks up a business user's verification status from `user_roles`.
 * @returns Status string (e.g. "pending" | "approved" | "rejected") or null if no role row exists
 */
export async function getBusinessVerificationStatus(userId: string) {
  const [roleRow] = await db
    .select({ verification_status: userRoles.verification_status })
    .from(userRoles)
    .where(eq(userRoles.user_id, userId));

  return roleRow?.verification_status ?? null;
}
