import { NextRequest, NextResponse } from 'next/server';
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
  const { data: joined, error: inviteError } = await db.rpc('accept_studio_invitations');
  if (inviteError) return signInError('signin');

  if (target) {
    const { data: access, error: accessError } = await db.rpc('studio_role', { studio: target });
    if (accessError) return signInError('signin');
    if (!access) return signInError('access');
  } else if (!joined) {
    const accessible = await db.from('workspaces').select('id').limit(1);
    if (accessible.error) return signInError('signin');
    if (!accessible.data.length) {
      const { error: setup } = await db.rpc('initialize_studio');
      if (setup) return signInError('signin');
    }
  }

  const response = NextResponse.redirect(new URL('/studio', url.origin));
  const active = target ?? joined;
  if (active) response.cookies.set(studioCookie, active, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:' });
  response.cookies.set(invitationCookie, '', { path: '/auth/callback', maxAge: 0 });
  return response;
}
