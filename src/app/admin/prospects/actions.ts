'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prospectStages } from '@/lib/platform-types';
import { importWebsiteUrl } from '@/lib/public-url';
import { workspaceIdPattern } from '@/lib/studio-access';

export async function saveProspect(id: string | null, _previous: { message: string }, form: FormData) {
  const { db } = await requirePlatformAdmin();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  let website = String(form.get('website') ?? '').trim();
  const stage = String(form.get('stage') ?? 'new');
  const date = String(form.get('next_date') ?? '');
  const notes = String(form.get('notes') ?? '').trim();
  const contact_name = String(form.get('contact_name') ?? '').trim();
  const source = String(form.get('source') ?? '').trim();
  const next_step = String(form.get('next_step') ?? '').trim();
  if (!name || name.length > 180 || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    || !prospectStages.some(([key]) => key === stage) || contact_name.length > 180 || source.length > 180
    || next_step.length > 500 || notes.length > 20000
    || (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))))) return { message: 'Check the prospect details and follow-up date.' };
  try { if (website) website = importWebsiteUrl(website).href; }
  catch { return { message: 'Enter a public website address.' }; }
  if (id && !workspaceIdPattern.test(id)) return { message: 'Choose a valid prospect.' };
  const row = { name, email, website, stage, next_date: date || null, notes, contact_name, source, next_step };
  const result = id ? await db.from('platform_prospects').update(row).eq('id', id).select('id').single()
    : await db.from('platform_prospects').insert(row).select('id').single();
  if (result.error || !result.data) return { message: 'The prospect could not be saved.' };
  revalidatePath('/admin/prospects');
  if (!id) redirect('/admin/prospects/' + result.data.id);
  revalidatePath('/admin/prospects/' + id);
  return { message: 'Prospect saved.' };
}
