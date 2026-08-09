import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * IMPORTANT: these clients are created lazily, inside functions, never at
 * module scope. Instantiating a Supabase client at import time reads
 * process.env immediately, which breaks Next.js route handlers during the
 * Vercel build's "collecting page data" step (env vars aren't guaranteed to
 * be populated at that phase for every route). Creating the client inside
 * the request-handling function avoids that entirely.
 */

export function getPublicSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars manquantes: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Server-only client using the service role key. Bypasses RLS — never
 * import this file from a "use client" component, and never expose
 * SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix.
 */
export function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env vars manquantes: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
