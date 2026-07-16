import { createClient } from "@supabase/supabase-js";

/** Browser/anon Supabase client — used for auth flows (login, register, password reset). */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
