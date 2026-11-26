'use server';

import { cookies } from 'next/headers';
import { invitationCookie, workspaceIdPattern } from '@/lib/studio-access';
import { database } from '@/lib/supabase';
import { finishPasswordSignIn } from '@/lib/finish-password-sign-in';

export async function requestSignIn(signup: boolean, studio: string | undefined, _previous: { message: string }, form: FormData) {
  if (studio && !workspaceIdPattern.test(studio)) return { message: 'This invitation link is invalid.' };
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Enter a valid email address.' };
  if (!password || (signup && password.length < 12)) return { message: signup ? 'Use at least 12 characters for your password.' : 'Enter your password.' };
  const db = await database();
  if (signup) {
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) return { message: 'We couldn’t create your account. If you already have an account, sign in or set a password below.' };
    if (!data.session) {
      if (studio) (await cookies()).set(invitationCookie, studio, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 3600 });
      return { message: 'Check your inbox to confirm your email once. After that, sign in with your email and password. Already registered? Choose Set or reset password below.' };
    }
  } else {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { message: error.code === 'email_not_confirmed' ? 'Please confirm your email using your welcome email before signing in.' : 'Email or password wasn’t recognised. If you previously used email links, choose Set or reset password below.' };
  }
  return finishPasswordSignIn(studio);
}

export async function requestPasswordReset(_previous: { message: string }, form: FormData) {
  const email = String(form.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Enter a valid email address.' };
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const db = await database();
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: new URL('/auth/callback', origin).href });
  if (!error) (await cookies()).set('fresnel-password-recovery', '1', { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 3600 });
  return { message: error ? 'We couldn’t send the password email. Please try again shortly.' : 'If this email has an account, a password setup link is on its way. Open the latest email in this browser, choose a password, then use it whenever you sign in.' };
}

export async function savePassword(_previous: { message: string }, form: FormData) {
  const password = String(form.get('password') || '');
  if (password.length < 12) return { message: 'Use at least 12 characters for your password.' };
  if (password !== String(form.get('confirmPassword') || '')) return { message: 'The passwords don’t match.' };
  const db = await database();
  if (!(await db.auth.getUser()).data.user) return { message: 'Your password link has expired. Request another password email.' };
  const { error } = await db.auth.updateUser({ password });
  if (error) return { message: 'Your password could not be saved. Try a different password or request a fresh password email.' };
  return finishPasswordSignIn();
}
