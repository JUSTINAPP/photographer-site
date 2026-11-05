'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStudioAccess } from '@/lib/supabase';
import { normaliseWebsite, websiteImage } from '@/lib/website';
import { portfolioHostname } from '@/lib/studio-domain';

function finish(section: string, status: string): never {
  revalidatePath('/studio', 'layout');
  redirect('/studio/settings?settings=' + status + '#' + section);
}

export async function saveStudioSettings(id: string, section: 'studio' | 'logo' | 'domain' | 'enquiries', form: FormData) {
  const { db, workspace } = await requireStudioAccess('admin');
  if (id !== workspace.id) finish('studio', 'changed');
  const text = (key: string) => String(form.get(key) ?? '').trim();
  if (section === 'domain') {
    if (form.get('intent') === 'recheck') redirect('/studio/settings?dns=' + Date.now() + '#domain');
    if (form.get('intent') === 'remove') {
      const { error } = await db.from('studio_domains').delete().eq('workspace_id', id);
      finish(section, error ? 'error' : 'saved');
    }
    const hostname = portfolioHostname(text('hostname'));
    if (!hostname) finish(section, 'domain');
    const { error } = await db.from('studio_domains').upsert({ workspace_id: id, hostname }, { onConflict: 'workspace_id' });
    finish(section, error ? 'error' : 'saved');
  }

  let patch: Record<string, unknown>;
  if (section === 'studio') {
    const name = text('name').slice(0, 100);
    const currentWebsite = websiteImage(text('currentWebsite'));
    if (!name || (text('currentWebsite') && !currentWebsite)) finish(section, 'invalid');
    patch = { name, currentWebsite };
  } else if (section === 'enquiries') {
    const { email } = normaliseWebsite({ email: text('email') });
    if (text('email') && !email) finish(section, 'invalid');
    patch = { email };
  } else if (section === 'logo') {
    patch = { logoSize: normaliseWebsite({ logoSize: Number(text('logoSize')) }).logoSize };
    const file = form.get('logo');
    if (form.get('intent') === 'remove') patch.logo = '';
    else if (file instanceof File && file.size) {
      if (file.size > 256 * 1024) finish(section, 'logo');
      const bytes = Buffer.from(await file.arrayBuffer());
      const mime = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
        : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'jpeg'
        : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : '';
      if (!mime) finish(section, 'logo');
      patch.logo = 'data:image/' + mime + ';base64,' + bytes.toString('base64');
    }
  } else {
    finish('studio', 'invalid');
  }
  const { error } = await db.rpc('patch_studio_settings', { studio: id, patch });
  finish(section, error ? 'error' : 'saved');
}

export async function takeWebsiteOffline(id: string) {
  const { db, workspace } = await requireStudioAccess('admin');
  if (id !== workspace.id) finish('website', 'changed');
  const { data, error } = await db.from('studio_websites').update({ published: null }).eq('workspace_id', id).select('public_id').maybeSingle();
  if (data) revalidatePath('/sites/' + data.public_id);
  finish('website', error ? 'error' : 'offline');
}
