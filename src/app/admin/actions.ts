'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { accountStatuses, planOptions } from '@/lib/platform-types';
import { studioCookie, workspaceIdPattern } from '@/lib/studio-access';
import { importWebsiteUrl } from '@/lib/public-url';

export async function prepareStudio(_previous: { message: string }, form: FormData) {
  const { db } = await requirePlatformAdmin();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  let website = String(form.get('website') ?? '').trim();
  if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Enter a studio name and valid photographer email.' };
  try { if (website) website = importWebsiteUrl(website).href; }
  catch { return { message: 'Enter a public website address such as www.photographer.com.' }; }
  const { data, error } = await db.rpc('prepare_photographer_studio', { customer_name: name, customer_email: email, customer_website: website });
  if (error || !data) return { message: 'The studio could not be prepared. Try again.' };
  const prospect = String(form.get('prospect') ?? '');
  if (workspaceIdPattern.test(prospect)) {
    const linked = await db.from('platform_prospects').update({ workspace_id: data, stage: 'onboarding' }).eq('id', prospect);
    if (!linked.error) revalidatePath('/admin/prospects');
  }
  revalidatePath('/admin');
  redirect('/admin/studios/' + data);
}

export async function openSupport(studio: string, _previous: { message: string }, form: FormData) {
  const { db } = await requirePlatformAdmin();
  if (!workspaceIdPattern.test(studio)) return { message: 'Choose a valid studio.' };
  const reason = String(form.get('reason') ?? '').trim();
  const minutes = Number(form.get('minutes'));
  if (reason.length < 3 || reason.length > 500 || ![30, 60, 240].includes(minutes)) return { message: 'Add a short reason and choose an access duration.' };
  const { error } = await db.rpc('open_platform_support', { studio, purpose: reason, minutes });
  if (error) return { message: 'Support access could not be opened. Please try again.' };
  (await cookies()).set(studioCookie, studio, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  revalidatePath('/admin/support');
  redirect(form.get('destination') === 'overview' ? '/studio' : '/studio/import');
}

export async function endSupport() {
  const { db } = await requirePlatformAdmin();
  const { error } = await db.rpc('end_platform_support');
  if (error) throw new Error('Support access could not be closed. Try again.');
  (await cookies()).delete(studioCookie);
  revalidatePath('/admin/support');
  redirect('/admin');
}

export async function saveStudioAccount(studio: string, _previous: { message: string }, form: FormData) {
  const { db } = await requirePlatformAdmin();
  const plan = String(form.get('plan'));
  const status = String(form.get('status'));
  const date = String(form.get('trial_ends_at') ?? '');
  const notes = String(form.get('notes') ?? '').trim();
  if (!workspaceIdPattern.test(studio) || !planOptions.some(([id]) => id === plan)
    || !accountStatuses.some(([id]) => id === status) || notes.length > 10000
    || (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))))) return { message: 'Check the plan, status, trial date and notes.' };
  const { error } = await db.from('platform_studio_accounts').upsert({ workspace_id: studio, plan, status, trial_ends_at: date || null, notes });
  if (error) return { message: 'Account details could not be saved.' };
  revalidatePath('/admin');
  revalidatePath('/admin/studios/' + studio);
  return { message: 'Account details saved.' };
}
