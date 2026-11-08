'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStudio, requireStudioAccess, validStudioId } from '@/lib/supabase';
import { studioCookie, teamRoles } from '@/lib/studio-access';

export async function manageTeam(studioId: string, _previous: string, form: FormData) {
  const { db, workspace, user, role: actor } = await requireStudioAccess('admin');
  if (workspace.id !== studioId) return 'changed';
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const role = form.get('role');
  const action = form.get('intent');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || email === user.email?.toLowerCase()) return 'invalid';
  const table = db.from('studio_team');
  if (action !== 'invite' && action !== 'update' && action !== 'remove') return 'invalid';
  if (action === 'remove') {
    const { data, error } = await table.delete().eq('workspace_id', workspace.id).eq('email', email).select('email').maybeSingle();
    if (error || !data) return 'error';
  } else {
    if (typeof role !== 'string' || !Object.hasOwn(teamRoles, role) || (role === 'admin' && actor !== 'owner')) return 'invalid';
    const { error } = action === 'update'
      ? await table.update({ role }).eq('workspace_id', workspace.id).eq('email', email).select('email').single()
      : await table.insert({ workspace_id: workspace.id, email, role });
    if (error) return error.code === '23505' ? 'exists' : 'error';
  }
  revalidatePath('/studio/settings');
  return action === 'remove' ? 'removed' : action === 'update' ? 'updated' : 'invited';
}

export async function switchStudio(form: FormData) {
  const { studios } = await requireStudio();
  const id = String(form.get('studio') ?? '');
  if (!validStudioId(id) || !studios.some(studio => studio.id === id)) redirect('/studio');
  (await cookies()).set(studioCookie, id, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  redirect('/studio');
}
