import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { studioCookie, workspaceIdPattern, type StudioRole } from './studio-access';
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
  const preference = (await cookies()).get(studioCookie)?.value;
  const studios = await db.from('workspaces').select('*').order('created_at');
  if (studios.error || !studios.data.length) throw new Error('Your studio is not ready. Sign out and sign in again.');
  const workspace = studios.data.find(item => item.id === preference)
    ?? studios.data.find(item => item.owner_id === user.id)
    ?? studios.data[0];
  const access = workspace.owner_id === user.id ? 'owner' : (await db.rpc('studio_role', { studio: workspace.id })).data;
  if (access !== 'owner' && access !== 'editor' && access !== 'viewer') throw new Error('You do not have access to this studio.');
  return { db, user, workspace, studios: studios.data, role: access as StudioRole };
}

export async function requireStudioAccess(level: 'owner' | 'edit') {
  const studio = await requireStudio();
  if (studio.role === 'owner' || (level === 'edit' && studio.role === 'editor')) return studio;
  redirect('/studio/website');
}

export const validStudioId = (id: string) => workspaceIdPattern.test(id);
