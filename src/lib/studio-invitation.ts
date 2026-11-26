import { createClient } from '@supabase/supabase-js';

// Keep the recipient's authentication flow separate from the admin's cookies/session.
export async function emailStudioInvitation(email: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { error: 'configuration' };
  const auth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await auth.auth.signInWithOtp({ email, options: {
    shouldCreateUser: true,
    emailRedirectTo: new URL('/auth/callback', origin).href,
  } });
  return { error: error?.code ?? (error ? 'delivery' : undefined) };
}
