/**
 * Returns true only when the business has been approved by an admin.
 * Safe for both server and client — no DB access.
 */
export function isBusinessVerified(status: string | null | undefined) {
  return status === "approved";
}
