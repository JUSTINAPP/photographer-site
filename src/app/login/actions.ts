'use server';

import { database } from '@/lib/supabase';

export async function requestSignIn(signup: boolean, _previous: { message: string }, form: FormData) {
  const email = String(form.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Enter a valid email address.' };

  try {
    const db = await database();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000');
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: signup, emailRedirectTo: new URL('/auth/callback', origin).href },
    });
    if (error && error.code !== 'otp_disabled') return { message: 'We couldn’t send an email link right now. Please try again shortly.' };
    return { message: signup ? 'Check your inbox for a link to open your studio.' : 'If you have an account, check your inbox for a secure sign-in link.' };
  } catch {
    return { message: 'Sign-in is temporarily unavailable. Please try again later.' };
  }
}
