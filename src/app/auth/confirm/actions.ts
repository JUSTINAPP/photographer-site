'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { database } from '@/lib/supabase';
import { completeSignIn } from '@/lib/complete-sign-in';
import { invitationCookie, studioCookie, workspaceIdPattern } from '@/lib/studio-access';

export async function confirmEmail(_previous: { message: string }, form: FormData) {
  const token = String(form.get('token_hash') ?? '');
  if (!/^[A-Za-z0-9_-]{32,256}$/i.test(token)) return { message: 'This link is incomplete. Sign in with your password or set one below.' };

  const db = await database();
  const { error } = await db.auth.verifyOtp({ token_hash: token, type: 'email' });
  if (error) return { message: 'This link has expired or has already been used. Sign in with your password or set one below.' };

  const jar = await cookies();
  const invitation = jar.get(invitationCookie)?.value;
  const target = invitation && workspaceIdPattern.test(invitation) ? invitation : undefined;
  const result = await completeSignIn(db, target);
  if (result.error === 'access') return { message: 'Your email is verified, but this studio has not invited this address. Check the invitation with its owner.' };
  if (result.error) return { message: 'Your email is verified, but your studio could not be opened. Please try signing in again below.' };

  if (result.studio) jar.set(studioCookie, result.studio, {
    path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
  });
  jar.set(invitationCookie, '', { path: '/auth/callback', maxAge: 0 });
  const platformAdmin = (await db.rpc('is_platform_admin')).data === true;
  redirect(platformAdmin ? '/admin' : '/studio');
}
