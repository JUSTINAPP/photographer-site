import { NextResponse } from 'next/server';
import { database } from '@/lib/supabase';
import { studioCookie } from '@/lib/studio-access';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const db = await database();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: joined, error: inviteError } = await db.rpc('accept_studio_invitations');
      if (!inviteError) {
        const accessible = joined ? null : await db.from('workspaces').select('id').limit(1);
        const { error: setup } = joined || accessible?.data?.length ? { error: null } : await db.rpc('initialize_studio');
        if (!setup) {
          const response = NextResponse.redirect(new URL('/studio', url.origin));
          if (joined) response.cookies.set(studioCookie, joined, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:' });
          return response;
        }
      }
    }
  }
  return NextResponse.redirect(new URL('/login?error=signin', url.origin));
}
