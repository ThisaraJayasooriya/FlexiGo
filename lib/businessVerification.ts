import { db } from "@/lib/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBusinessVerificationStatus(userId: string) {
  const [roleRow] = await db
    .select({ verification_status: userRoles.verification_status })
    .from(userRoles)
    .where(eq(userRoles.user_id, userId));

  return roleRow?.verification_status ?? null;
}
