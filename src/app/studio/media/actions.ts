'use server';

import { revalidatePath } from 'next/cache';
import { requireStudio } from '@/lib/supabase';
import { readPublicFile, websiteUrl } from '@/lib/importer';
import type { FoundMedia } from '@/lib/import-media';

export async function saveImportedMedia(input: FoundMedia[]) {
  const { db, workspace } = await requireStudio();
  if (!Array.isArray(input) || input.length < 1 || input.length > 150) throw new Error('Select up to 150 media items.');
  const rows = new Map(input.map(item => {
    const url = websiteUrl(item.url).href;
    if (url.length > 2048 || !['photo', 'video'].includes(item.kind)) throw new Error('Invalid media item.');
    return [url, { workspace_id: workspace.id, kind: item.kind, name: String(item.name || 'Imported media').trim().slice(0, 150) || 'Imported media', source_url: url }];
  }));
  const { error } = await db.from('studio_media').upsert([...rows.values()], {
    onConflict: 'workspace_id,source_url', ignoreDuplicates: true,
  });
  if (error) throw new Error('Media could not be saved.');
  revalidatePath('/studio/media');
}

export async function renameMedia(form: FormData) {
  const { db, workspace } = await requireStudio();
  const name = String(form.get('name') ?? '').trim().slice(0, 150);
  if (!name) throw new Error('Enter a name for this file.');
  const { error } = await db.from('studio_media').update({ name }).eq('id', String(form.get('id'))).eq('workspace_id', workspace.id);
  if (error) throw new Error('The name could not be saved.');
  revalidatePath('/studio/media');
}

export async function keepMediaOriginal(id: string) {
  const { db, workspace } = await requireStudio();
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
