import { NextRequest, NextResponse } from 'next/server';
import { completeSignIn } from '@/lib/complete-sign-in';
import { database } from '@/lib/supabase';
import { invitationCookie, studioCookie, workspaceIdPattern } from '@/lib/studio-access';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const studio = request.cookies.get(invitationCookie)?.value;
  const target = studio && workspaceIdPattern.test(studio) ? studio : undefined;
  const signInError = (reason: string) => NextResponse.redirect(new URL(
    target ? '/join/' + target + '?error=' + reason : '/login?error=signin', url.origin,
  ));

  if (!code) return signInError('signin');
  const db = await database();
  const { error } = await db.auth.exchangeCodeForSession(code);
  if (error) return signInError('signin');
  const result = await completeSignIn(db, target);
  if (result.error) return signInError(result.error);

  const platformAdmin = (await db.rpc('is_platform_admin')).data === true;
  const response = NextResponse.redirect(new URL(platformAdmin ? '/admin' : '/studio', url.origin));
  const active = result.studio;
  if (active) response.cookies.set(studioCookie, active, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:' });
  response.cookies.set(invitationCookie, '', { path: '/auth/callback', maxAge: 0 });
  return response;
}
