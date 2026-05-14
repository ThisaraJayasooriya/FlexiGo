import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase Admin client — used ONLY for:
 * - Auth verification:  supabaseAdmin.auth.getUser(token)
 * - Storage uploads:    supabaseAdmin.storage.from(...).upload(...)
 *
 * All database queries use Drizzle ORM (lib/db.ts) instead.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
