import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const configured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export async function database() {
  if (!configured()) throw new Error('Supabase connection is not configured.');
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {getAll:()=>jar.getAll(), setAll:values=>{try {values.forEach(({name,value,options})=>jar.set(name,value,options));} catch { /* Read-only server component; middleware refreshes cookies. */ }}}
  });
}
export async function requireStudio(redirectOnMissingAuth = true) {
  if (!configured()) {
    if (redirectOnMissingAuth) redirect('/login');
    throw new Error('Supabase connection is not configured.');
  }
  const db = await database();
  const {data:{user}} = await db.auth.getUser();
  if (!user) {
    if (redirectOnMissingAuth) redirect('/login');
    throw new Error('Please sign in to your studio.');
  }
  const {data:workspace,error} = await db.from('workspaces').select('*').eq('owner_id',user.id).single();
  if(error || !workspace) throw new Error('Your studio is not ready. Sign out and sign in again.');
  return {db,user,workspace};
}
