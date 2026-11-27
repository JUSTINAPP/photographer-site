import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { canEditWebsite, isStudioAdmin, teamRoles, studioCookie, workspaceIdPattern, type StudioRole } from './studio-access';
import { redirect } from 'next/navigation';
export const configured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const database = cache(async function database() {
  if (!configured()) throw new Error('Supabase connection is not configured.');
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {getAll:()=>jar.getAll(), setAll:values=>{try {values.forEach(({name,value,options})=>jar.set(name,value,options));} catch { /* Read-only server component; middleware refreshes cookies. */ }}}
  });
});
export const currentUser = cache(async () => (await (await database()).auth.getUser()));
export const studioBrand = cache(async (studio: string) => {
  const db = await database();
  return db.from('studio_websites').select('draft_name:draft->>name,published_name:published->>name,public_id,slug').eq('workspace_id', studio).maybeSingle();
});
export const requireStudio = cache(async function requireStudio(redirectOnMissingAuth = true) {
  if (!configured()) {
    if (redirectOnMissingAuth) redirect('/login');
    throw new Error('Supabase connection is not configured.');
  }
  const db = await database();
  const {data:{user}} = await currentUser();
  if (!user) {
    if (redirectOnMissingAuth) redirect('/login');
    throw new Error('Please sign in to your studio.');
  }
  const platformAdmin = (await db.rpc('is_platform_admin')).data === true;
  const preference = (await cookies()).get(studioCookie)?.value;
  const studios = await db.from('workspaces').select('*').order('created_at');
  if (studios.error) throw new Error('Your studios could not be loaded. Please refresh.');
  if (!studios.data.length && platformAdmin) redirect('/admin');
  if (!studios.data.length) throw new Error('Your studio is not ready. Sign out and sign in again.');
  const workspace = studios.data.find(item => item.id === preference)
    ?? studios.data.find(item => item.owner_id === user.id)
    ?? studios.data[0];
  const access = workspace.owner_id === user.id ? 'owner' : (await db.rpc('studio_role', { studio: workspace.id })).data;
  if (access !== 'owner' && (typeof access !== 'string' || !Object.hasOwn(teamRoles, access))) throw new Error('You do not have access to this studio.');
  return { db, user, workspace, studios: studios.data, role: access as StudioRole, platformAdmin };
});

export async function requireStudioAccess(level: 'owner' | 'admin' | 'edit' | 'social' | 'calendar') {
  const studio = await requireStudio();
  const { role } = studio;
  if (role === 'owner' || (level !== 'owner' && isStudioAdmin(role))
    || (level === 'edit' && canEditWebsite(role))
    || (level === 'social' && role === 'social')
    || (level === 'calendar' && role === 'assistant')) return studio;
  redirect('/studio');
}

export const validStudioId = (id: string) => workspaceIdPattern.test(id);
