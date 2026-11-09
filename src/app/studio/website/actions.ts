'use server';

import { mediaIdentity } from '@/lib/import-identity';

import { revalidatePath } from 'next/cache';
import { requireStudioAccess } from '@/lib/supabase';
import { normaliseWebsite, publishWebsiteSnapshot, websiteImage, type WebsiteProject } from '@/lib/website';

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
    if (draft.homepageProjects !== null || Object.keys(draft.sections).length || Object.keys(draft.related).length || draft.homeGallery?.some(image => image.link) || Object.values(draft.placements).some(frames => frames.some(image => image.link))) {
      const projects = await db.from('projects').select('id,title,category,description,image_url,published')
        .eq('workspace_id', workspace.id).order('created_at', { ascending: false });
      if (projects.error) return { error: 'The linked pages could not be loaded. Please try again.' };
      values.published = publishWebsiteSnapshot(draft, projects.data ?? []);
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

export async function importPageStructure(studioId: string, input: string) {
  const { db, workspace } = await requireStudioAccess('edit');
  if (workspace.id !== studioId) return { error: 'The active studio changed. Reopen the editor.' };
  const { data: allowed } = await db.rpc('claim_import_preview', { workspace: studioId });
  if (!allowed) return { error: 'Please wait one minute before scanning again.' };

  try {
    const { previewWebsite } = await import('@/lib/importer');
    const scan = await previewWebsite(input);
    const { data: media, error: mediaError } = await db.from('studio_media').select('source_url,kind').eq('workspace_id', studioId);
    if (mediaError) return { error: 'Could not read the media library.' };
    const urls = new Map((media ?? []).filter(item => item.kind === 'photo').map(item => [mediaIdentity(item.source_url), item.source_url]));
    if (!urls.size) return { error: 'Import and save photos in Media before restoring page order.' };
    const orderedPhotos = (items: { url: string }[]) => [...new Set(items.flatMap(item => urls.get(mediaIdentity(item.url)) ?? []))];
    const home = orderedPhotos(scan.homepageMedia);
    const sourcePages = scan.pages.filter(page => orderedPhotos(page.media).length);
    const candidates = scan.candidates.filter(candidate => sourcePages.some(page => page.source === candidate.source_url));
    const rows = candidates.map(candidate => ({ ...candidate, workspace_id: studioId, published: false }));
    if (rows.length) {
      const result = await db.from('projects').upsert(rows, { onConflict: 'workspace_id,source_url', ignoreDuplicates: true });
      if (result.error) return { error: 'Could not create imported pages.' };
    }
    const { data: projects, error } = await db.from('projects').select('id,title,category,description,image_url,published,source_url')
      .eq('workspace_id', studioId).order('created_at', { ascending: false });
    if (error) return { error: 'Could not load imported pages.' };
    const pages = sourcePages.flatMap(page => {
      const project = projects?.find(item => item.source_url === page.source);
      return project ? [{ id: project.id, photos: orderedPhotos(page.media) }] : [];
    });
    if (!home.length && !pages.length) return { error: 'No saved photos matched this scan. The source may have changed or may load photos through scripts.' };
    revalidatePath('/studio/projects');
    return { home, pages, projects: projects ?? [], warningCount: scan.warnings.length };
  } catch {
    return { error: 'The source site could not be scanned. Check the address and try again.' };
  }
}

export async function createCampaignPage(studioId: string, input: { title: string; category: string; description: string }) {
  const { db, workspace } = await requireStudioAccess('edit');
  if (workspace.id !== studioId) return { error: 'The active studio changed. Reopen the editor.' };
  const title = String(input.title ?? '').trim().slice(0, 180);
  if (!title) return { error: 'Enter a campaign name.' };
  const { data, error } = await db.from('projects').insert({
    workspace_id: studioId,
    title,
    category: String(input.category ?? '').trim().slice(0, 80) || 'Campaign',
    description: String(input.description ?? '').trim().slice(0, 2000),
    source_url: 'urn:uuid:' + crypto.randomUUID(),
    published: false,
  }).select('id,title,category,description,image_url,published').single();
  if (error) return { error: 'The campaign page could not be created.' };
  revalidatePath('/studio/projects');
  return { project: data as WebsiteProject };
}
