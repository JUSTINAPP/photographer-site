import {NextResponse} from 'next/server';import {database} from '@/lib/supabase';
export async function POST(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)return new NextResponse('Invalid origin',{status:403});const db=await database();await db.auth.signOut();return NextResponse.redirect(new URL('/login',request.url),303);}
