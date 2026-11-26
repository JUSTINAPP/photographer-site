'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { database } from '@/lib/supabase';
import { completeSignIn } from '@/lib/complete-sign-in';
import { studioCookie } from '@/lib/studio-access';

export async function openInvitedStudio() {
  const db = await database();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { message: 'This invitation has expired. Request another invitation or sign in with your password.' };
  const result = await completeSignIn(db);
  if (result.error) return { message: 'Your email is verified, but your studio could not be opened. Please contact Fresnel support.' };
  if (result.studio) (await cookies()).set(studioCookie, result.studio, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  redirect('/reset-password');
}
