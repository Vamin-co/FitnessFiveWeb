/**
 * @fileoverview Server-side Supabase Client
 * 
 * Creates a Supabase client for use in Server Components and Server Actions.
 * Uses Next.js cookies() API for session management.
 * 
 * @module utils/supabase/server
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs}
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side usage.
 * 
 * Use this in Server Components, Server Actions, and Route Handlers.
 * The client reads/writes auth cookies via Next.js cookies() API.
 * 
 * @returns Promise resolving to Supabase client configured for server environment
 * 
 * @example
 * ```typescript
 * // In a Server Component or Server Action
 * import { createClient } from "@/utils/supabase/server";
 * 
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
            },
        }
    );
}
