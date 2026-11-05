'use server';

import { revalidatePath } from 'next/cache';
import { requireStudio } from '@/lib/supabase';
import { normaliseWebsite, websiteImage } from '@/lib/website';

export async function saveWebsite(input: unknown, mode: 'draft' | 'publish' | 'unpublish') {
  const { db, workspace } = await requireStudio();
  const draft = normaliseWebsite(input);
  if (mode === 'publish' && !draft.name) return { error: 'Add a portfolio name before publishing.' };
  const values: { workspace_id: string; draft: typeof draft; published?: typeof draft | null } = {
    workspace_id: workspace.id, draft,
  };
  if (mode === 'publish') values.published = draft;
  if (mode === 'unpublish') values.published = null;
  const { data, error } = await db.from('studio_websites')
    .upsert(values, { onConflict: 'workspace_id', defaultToNull: false })
    .select('public_id, published').single();
  if (error) return { error: 'The website could not be saved. Please try again.' };
  revalidatePath('/studio/website');
  revalidatePath('/sites/' + data.public_id);
  return { id: data.public_id as string, published: !!data.published };
}

export async function addWebsiteProject(form: FormData) {
  const { db, workspace } = await requireStudio();
  const title = String(form.get('title') ?? '').trim().slice(0, 180);
  const image = websiteImage(String(form.get('image') ?? ''));
  if (!title || !image) throw new Error('Enter a title and an HTTPS image URL.');
  const { error } = await db.from('projects').insert({
    workspace_id: workspace.id,
    title,
    image_url: image,
    category: String(form.get('category') ?? '').trim().slice(0, 80) || 'Selected work',
    description: String(form.get('description') ?? '').trim().slice(0, 2000),
    source_url: 'urn:uuid:' + crypto.randomUUID(),
    published: false,
  });
  if (error) throw new Error('The project could not be saved.');
  revalidatePath('/studio/projects');
  revalidatePath('/studio/website');
}
