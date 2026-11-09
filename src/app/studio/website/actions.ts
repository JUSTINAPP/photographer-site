'use server';

import { saveImportedMedia } from '@/app/studio/media/actions';
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

export async function rebuildPortfolioCollections(studioId: string, input: string, recoverMissing = false) {
  const { db, workspace } = await requireStudioAccess('edit');
  if (workspace.id !== studioId) return { error: 'The active studio changed. Reopen the editor.' };
  try {
    const { importWebsiteUrl } = await import('@/lib/public-url');
    const address = importWebsiteUrl(input).href;
    const { data: allowed } = await db.rpc('claim_import_preview', { workspace: studioId });
    if (!allowed) return { error: 'Please wait one minute before scanning again.' };
    const { scanPortfolioCollections } = await import('@/lib/import-collections');
    const scan = await scanPortfolioCollections(address);
    if (!scan.projects.length) return { error: 'No Squarespace galleries were found. Check the site address.' };

    async function readLibrary() {
      const library = new Map<string, string>();
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from('studio_media').select('source_url').eq('workspace_id', studioId).order('id').range(offset, offset + 499);
        if (error) throw new Error('Could not read the Media library.');
        for (const item of data) library.set(mediaIdentity(item.source_url), item.source_url);
        if (data.length < 500) return library;
      }
    }
    let library = await readLibrary();
    const { vimeoEmbed } = await import('@/lib/import-identity');
    let added = 0;
    if (recoverMissing) {
      const missing = new Map(scan.projects.flatMap(project => project.media)
        .filter(item => !library.has(mediaIdentity(item.url)))
        .map(item => [mediaIdentity(item.url), item]));
      const items = [...missing.values()];
      for (let start = 0; start < items.length; start += 2500) {
        const result = await saveImportedMedia(items.slice(start, start + 2500), studioId);
        added += result.added;
      }
      if (items.length) library = await readLibrary();
    }
    const unmatched = new Map<string, string>();
    const prepared = scan.projects.map(({ media, ...project }) => {
      const photos: string[] = [];
      let film = '';
      for (const item of media) {
        const key = mediaIdentity(item.url);
        const stored = library.get(key);
        if (!stored) { unmatched.set(key, item.name); continue; }
        if (item.kind === 'photo') photos.push(stored);
        else if (!film) film = vimeoEmbed(stored) ?? '';
      }
      return { ...project, photos: [...new Set(photos)].slice(0, 100), film };
    }).filter(project => project.photos.length || project.film);
    if (!prepared.length) return {
      error: 'No images or Vimeo films matched your library. Use Add missing media and rebuild to bring in the files from the source galleries.',
      unmatched: unmatched.size,
    };

    const projectColumns = 'id,title,category,description,image_url,published,source_url';
    const existing = await db.from('projects').select(projectColumns).eq('workspace_id', studioId);
    if (existing.error) return { error: 'Could not check for existing project drafts.' };
    const sourceKey = (url: string) => url.replace(/\/$/, '');
    let allProjects = existing.data;
    const bySource = new Map(allProjects.map(project => [sourceKey(project.source_url), project]));
    const fresh = [...new Map(prepared.filter(project => !bySource.has(sourceKey(project.source_url))).map(project => [sourceKey(project.source_url), {
      workspace_id: studioId, source_url: project.source_url, title: project.title, category: project.category,
      image_url: project.photos[0] ?? null, description: '', published: false,
    }])).values()];
    if (fresh.length) {
      const result = await db.from('projects').upsert(fresh, { onConflict: 'workspace_id,source_url', ignoreDuplicates: true });
      if (result.error) return { error: 'Could not create the private project drafts.' };
      const loaded = await db.from('projects').select(projectColumns).eq('workspace_id', studioId);
      if (loaded.error) return { error: 'Could not load the project drafts. You can retry safely.' };
      allProjects = loaded.data;
      for (const project of allProjects) bySource.set(sourceKey(project.source_url), project);
    }
    const pages = prepared.flatMap(({ source_url, category, photos, film }) => {
      const project = bySource.get(sourceKey(source_url));
      return project ? [{ id: project.id, category, photos, film }] : [];
    });
    revalidatePath('/studio/projects');
    return { projects: allProjects, pages, added, unmatched: unmatched.size, review: [...unmatched.values()].slice(0, 100), missing: scan.missing, instagram: websiteImage(scan.instagram) };
  } catch {
    return { error: recoverMissing
      ? 'Could not finish adding media and rebuilding. Try again to continue. Files already saved will be skipped.'
      : 'The Squarespace site could not be scanned. Check the address and try again.' };
  }
}
