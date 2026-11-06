'use server';

import { revalidatePath } from 'next/cache';
import { requireStudioAccess } from '@/lib/supabase';
import { homepageWork, normaliseWebsite, websiteImage, type WebsiteProject } from '@/lib/website';

export async function saveWebsite(studioId: string, input: unknown, mode: 'draft' | 'publish' | 'unpublish') {
  const { db, workspace } = await requireStudioAccess('edit');
  if (workspace.id !== studioId) return { error: 'The active studio changed. Reopen Website design before saving.' };
  const current = await db.from('studio_websites').select('draft').eq('workspace_id', workspace.id).maybeSingle();
  if (current.error) return { error: 'The website settings could not be loaded.' };
  const { logo, logoSize, currentWebsite } = normaliseWebsite(current.data?.draft);
  const draft = { ...normaliseWebsite(input), logo, logoSize, currentWebsite };
  if (mode === 'publish' && !draft.name) return { error: 'Add a portfolio name before publishing.' };
  const values: { workspace_id: string; draft: typeof draft; published?: (typeof draft & { projectSnapshot?: WebsiteProject[] }) | null } = {
    workspace_id: workspace.id, draft,
  };
  if (mode === 'publish') {
    values.published = draft;
    if (draft.homepageProjects !== null) {
      const projects = draft.homepageProjects.length
        ? await db.from('projects').select('id,title,category,description,image_url').eq('workspace_id', workspace.id).in('id', draft.homepageProjects)
        : null;
      if (projects?.error) return { error: 'The selected projects could not be loaded. Please try again.' };
      values.published = { ...draft, projectSnapshot: homepageWork(draft, projects?.data ?? []) };
    }
  }
  if (mode === 'unpublish') values.published = null;
  const { data, error } = await db.from('studio_websites')
    .upsert(values, { onConflict: 'workspace_id', defaultToNull: false })
    .select('public_id, published').single();
  if (error) return { error: 'The website could not be saved. Please try again.' };
  revalidatePath('/studio/website');
  revalidatePath('/studio/settings');
  revalidatePath('/studio/website/preview');
  revalidatePath('/sites/' + data.public_id);
  return { id: data.public_id as string, published: !!data.published };
}

export async function addWebsiteProject(form: FormData) {
  const { db, workspace } = await requireStudioAccess('edit');
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
