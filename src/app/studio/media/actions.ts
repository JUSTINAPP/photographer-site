'use server';

import { revalidatePath } from 'next/cache';
import { requireStudioAccess } from '@/lib/supabase';
import { readPublicFile, websiteUrl } from '@/lib/importer';
import { mediaIdentity } from '@/lib/import-identity';
import { existingMediaIdentities } from '@/lib/import-library';
import type { FoundMedia } from '@/lib/import-media';

export async function saveImportedMedia(input: FoundMedia[], studioId?: string) {
  const { db, workspace } = await requireStudioAccess('edit');
  if (studioId && workspace.id !== studioId) throw new Error('The active studio changed. Reopen the editor.');
  if (!Array.isArray(input) || input.length < 1 || input.length > 2500) throw new Error('Select up to 2,500 media items.');
  const existing = await existingMediaIdentities(db, workspace.id);
  const rows = new Map(input.map(item => {
    const source_url = websiteUrl(item.url).href;
    const key = mediaIdentity(source_url);
    if (source_url.length > 2048 || !['photo', 'video'].includes(item.kind)) throw new Error('Invalid media item.');
    return [key, { workspace_id: workspace.id, kind: item.kind, name: String(item.name || 'Imported media').trim().slice(0, 150) || 'Imported media', source_url: key }];
  }));
  const fresh = [...rows].filter(([key]) => !existing.has(key)).map(([, row]) => row);
  let added = 0;
  for (let start = 0; start < fresh.length; start += 150) {
    const { data, error } = await db.from('studio_media').upsert(fresh.slice(start, start + 150), {
      onConflict: 'workspace_id,source_url', ignoreDuplicates: true,
    }).select('id');
    if (error) throw new Error('Some media could not be saved. Try again to add the remaining files.');
    added += data.length;
  }
  revalidatePath('/studio/media');
  revalidatePath('/studio/website');
  return { added, skipped: input.length - added };
}

export async function renameMedia(form: FormData) {
  const { db, workspace } = await requireStudioAccess('edit');
  const name = String(form.get('name') ?? '').trim().slice(0, 150);
  if (!name) throw new Error('Enter a name for this file.');
  const { error } = await db.from('studio_media').update({ name }).eq('id', String(form.get('id'))).eq('workspace_id', workspace.id);
  if (error) throw new Error('The name could not be saved.');
  revalidatePath('/studio/media');
}

export async function keepMediaOriginal(id: string) {
  const { db, workspace } = await requireStudioAccess('edit');
  const { data } = await db.from('studio_media').select('id,kind,source_url').eq('id', id).eq('workspace_id', workspace.id).single();
  if (!data) return { error: 'Media not found.' };
  const path = `${workspace.id}/media/${data.id}`;
  const storage = db.storage.from('studio-originals');
  const existing = await storage.createSignedUrl(path, 600);
  if (existing.data) return { url: existing.data.signedUrl };
  const photo = data.kind === 'photo';
  try {
    const file = await readPublicFile(data.source_url, {
      accept: photo ? 'image/*' : 'video/mp4',
      maxBytes: photo ? 15_000_000 : 25_000_000,
      types: photo ? ['image/jpeg', 'image/png', 'image/webp'] : ['video/mp4'],
    });
    await storage.upload(path, file.body, { contentType: file.type, upsert: false });
    const saved = await storage.createSignedUrl(path, 600);
    if (saved.data) return { url: saved.data.signedUrl };
  } catch {
    return { error: 'Could not copy this source. Photos support JPEG, PNG and WebP up to 15 MB. Videos support MP4 up to 25 MB.' };
  }
  return { error: 'The private copy could not be saved.' };
}

export async function selectWebsiteMedia(id: string, selected: boolean) {
  const { db, workspace } = await requireStudioAccess('edit');
  const { data, error } = await db.from('studio_media').update({ website_selected: selected === true })
    .eq('workspace_id', workspace.id).eq('id', id).select('id').maybeSingle();
  if (error || !data) throw new Error('Could not update website selection.');
  revalidatePath('/studio/media');
  revalidatePath('/studio/website');
}

export async function createMediaCategory(studioId: string, _previous: string, form: FormData) {
  const { db, workspace } = await requireStudioAccess('edit');
  if (workspace.id !== studioId) return 'The active studio changed. Refresh Media and try again.';
  const name = String(form.get('name') ?? '').trim();
  if (!name || name.length > 60) return 'Enter a category name up to 60 characters.';
  const { error } = await db.from('studio_media_categories').insert({ workspace_id: studioId, name });
  if (error) return error.code === '23505' ? 'That category already exists.' : 'Could not create the category.';
  revalidatePath('/studio/media');
  return 'Category added.';
}

export async function organiseMedia(studioId: string, _previous: string, form: FormData) {
  const { db, workspace } = await requireStudioAccess('edit');
  if (workspace.id !== studioId) return 'The active studio changed. Refresh Media and try again.';
  const { workspaceIdPattern } = await import('@/lib/studio-access');
  const ids = [...new Set(form.getAll('media').map(String))];
  if (!ids.length || ids.length > 100 || ids.some(id => !workspaceIdPattern.test(id))) return 'Select up to 100 files first.';
  const operation = String(form.get('operation') ?? '');
  const category = String(form.get('category') ?? '');
  const year = String(form.get('year') ?? '').trim();
  if (operation === 'year' && year && (!/^\d{4}$/.test(year) || Number(year) < 1800 || Number(year) > 2100)) return 'Enter a year between 1800 and 2100, or leave it blank to clear it.';
  if (operation !== 'year' && (!['add', 'remove'].includes(operation) || !workspaceIdPattern.test(category))) return 'Choose a category first.';
  const { data, error } = await db.rpc('organise_studio_media', {
    studio: studioId, assets: ids, operation, category: operation === 'year' ? null : category,
    year_value: operation === 'year' && year ? Number(year) : null,
  });
  if (error || !data) return 'Could not update the selected files.';
  revalidatePath('/studio/media');
  return `Updated ${data} ${data === 1 ? 'file' : 'files'}.`;
}
