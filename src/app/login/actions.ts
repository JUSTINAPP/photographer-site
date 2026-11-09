'use server';

import { cookies } from 'next/headers';
import { invitationCookie, workspaceIdPattern } from '@/lib/studio-access';
import { database } from '@/lib/supabase';

export async function requestSignIn(signup: boolean, studio: string | undefined, _previous: { message: string }, form: FormData) {
  if (studio && !workspaceIdPattern.test(studio)) return { message: 'This invitation link is invalid.' };
  const email = String(form.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Enter a valid email address.' };

  try {
    const db = await database();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000');
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: signup, emailRedirectTo: new URL('/auth/callback', origin).href },
    });
    if (error) return { message: 'We couldn’t send an email link right now. Please try again shortly.' };
    const jar = await cookies();
    if (studio) {
      jar.set(invitationCookie, studio, { path: '/auth/callback', httpOnly: true, sameSite: 'lax', secure: new URL(origin).protocol === 'https:', maxAge: 3600 });
    } else {
      jar.set(invitationCookie, '', { path: '/auth/callback', maxAge: 0 });
    }
    if (studio) return { message: 'Check your inbox and open the link in this browser to join the studio.' };
    return { message: signup ? 'Check your inbox for a link to open your studio.' : 'If you have an account, check your inbox for a secure sign-in link.' };
  } catch {
    return { message: 'Sign-in is temporarily unavailable. Please try again later.' };
  }
}
