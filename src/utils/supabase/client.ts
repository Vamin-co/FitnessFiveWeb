/**
 * @fileoverview Browser-side Supabase Client
 * 
 * Creates a Supabase client for use in Client Components.
 * Uses browser cookies for session management.
 * 
 * @module utils/supabase/client
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs}
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser/client-side usage.
 * 
 * Use this in Client Components (files with "use client" directive).
 * The client automatically handles authentication state via cookies.
 * 
 * @returns Supabase client configured for browser environment
 * 
 * @example
 * ```typescript
 * "use client";
 * 
 * import { createClient } from "@/utils/supabase/client";
 * 
 * const supabase = createClient();
 * const { data } = await supabase.auth.getUser();
 * ```
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
