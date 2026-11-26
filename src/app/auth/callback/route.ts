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

  // Default Supabase email links carry the verified session in the URL fragment.
  // Redirects preserve that fragment; the welcome screen installs it in this browser.
  if (!code) return NextResponse.redirect(new URL('/auth/welcome', url.origin));
  const db = await database();
  const { error } = await db.auth.exchangeCodeForSession(code);
  if (error) return signInError('signin');
  if (request.cookies.get('fresnel-password-recovery')?.value === '1' || url.searchParams.get('next') === 'reset-password') {
    const response = NextResponse.redirect(new URL('/reset-password', url.origin));
    response.cookies.set('fresnel-password-recovery', '', { path: '/', maxAge: 0 });
    return response;
  }
  const result = await completeSignIn(db, target);
  if (result.error) return signInError(result.error);

  const platformAdmin = (await db.rpc('is_platform_admin')).data === true;
  const response = NextResponse.redirect(new URL(platformAdmin ? '/admin' : '/studio', url.origin));
  const active = result.studio;
  if (active) response.cookies.set(studioCookie, active, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:' });
  response.cookies.set(invitationCookie, '', { path: '/auth/callback', maxAge: 0 });
  return response;
}
