import { NextResponse } from 'next/server';
import { database } from '@/lib/supabase';
import { studioCookie } from '@/lib/studio-access';

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new NextResponse('Invalid origin', { status: 403 });
  const db = await database();
  await db.auth.signOut();
  const response = NextResponse.redirect(new URL('/login', request.url), 303);
  response.cookies.delete(studioCookie);
  return response;
}
