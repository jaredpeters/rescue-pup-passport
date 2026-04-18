import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/** Returns the singleton Supabase client, or null if env vars are missing. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

/** True only if both env vars are set AND are not the template placeholder values. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("your-project-id")) return false;
  if (key.includes("your-anon-public-key")) return false;
  return true;
}
