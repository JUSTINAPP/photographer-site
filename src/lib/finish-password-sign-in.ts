import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { database } from '@/lib/supabase';
import { completeSignIn } from '@/lib/complete-sign-in';
import { studioCookie } from '@/lib/studio-access';

export async function finishPasswordSignIn(target?: string) {
  const db = await database();
  const result = await completeSignIn(db, target);
  if (result.error) return { message: result.error === 'access' ? 'This email does not have access to this studio. Check the invited address.' : 'You are signed in, but your studio could not be opened. Please try again.' };
  if (result.studio) (await cookies()).set(studioCookie, result.studio, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  redirect((await db.rpc('is_platform_admin')).data === true ? '/admin' : '/studio');
}
