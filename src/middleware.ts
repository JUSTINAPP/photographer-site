import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
export async function middleware(request:NextRequest){
  if (request.nextUrl.pathname === '/') {
   const host = request.headers.get('host')?.toLowerCase() || '';
   const platform = !host || host === 'fresnelstudio.com' || host.endsWith('.fresnelstudio.com')
     || host.endsWith('.vercel.app') || host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
   if (platform) return NextResponse.next();
   const target = request.nextUrl.clone();
   target.pathname = '/portfolio-domain';
   return NextResponse.rewrite(target);
 }
 let response=NextResponse.next({request});
  if(!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return response;
  const db=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
  await db.auth.getUser();return response;
}
export const config={matcher:['/','/studio/:path*','/login','/auth/:path*']};
