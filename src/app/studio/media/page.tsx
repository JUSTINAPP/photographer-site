import MediaYearFilter from '@/components/MediaYearFilter';
import MediaOrganisation from '@/components/MediaOrganisation';
import { portfolioCollections } from '@/lib/portfolio-collections';
import { mediaIdentity, vimeoEmbed } from '@/lib/import-identity';
import { ActionLink, SubmitButton } from '@/components/ActionFeedback';
import { canEditWebsite } from '@/lib/studio-access';
import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import WebsiteMediaCheckbox from '@/components/WebsiteMediaCheckbox';
import MediaExports from '@/components/MediaExports';
import { requireStudio } from '@/lib/supabase';
import { normaliseWebsite, websiteGallery, websiteImage } from '@/lib/website';
import { renameMedia } from './actions';

export default async function MediaLibrary({ searchParams }: { searchParams: Promise<{ view?: string; collection?: string; year?: string; page?: string; gallery?: string }> }) {
  const { db, user, workspace, role } = await requireStudio();
  const { view, collection, year, page, gallery } = await searchParams;
  const kind = view === 'videos' ? 'video' : 'photo';
  async function loadAssets() {
    const batchSize = 500;
    const assets = [];
    for (let start = 0; ; start += batchSize) {
      const { data, error } = await db.from('studio_media').select('id,name,source_url,kind,website_selected,category_ids,capture_year')
        .eq('workspace_id', workspace.id).eq('kind', kind).order('created_at', { ascending: false }).order('id')
        .range(start, start + batchSize - 1);
      if (error) return { data: [], error };
      assets.push(...data);
      if (data.length < batchSize) return { data: assets, error: null };
    }
  }
  const [{ data, error }, { data: website }, { data: customCategories, error: categoryError }] = await Promise.all([
    loadAssets(),
    db.from('studio_websites').select('draft').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('studio_media_categories').select('id,name').eq('workspace_id', workspace.id).order('name'),
  ]);
  const draft = normaliseWebsite(website?.draft);
  const derived = portfolioCollections.filter(({ name }) => Object.values(draft.collections).includes(name));
  const custom = customCategories ?? [];
  const categoryNames = new Map(custom.map(category => [category.id, category.name]));
  const selected = derived.find(({ name }) => name.toLowerCase() === collection);
  const customSelected = custom.find(category => category.id === collection);
  const activeCollection = selected?.name.toLowerCase() ?? customSelected?.id;
  const projectIds = [...new Set([...draft.projectOrder, ...Object.keys(draft.collections)])]
    .filter(id => draft.collections[id] === selected?.name);
  const { data: projects, error: projectError } = projectIds.length
    ? await db.from('projects').select('id,title,image_url').eq('workspace_id', workspace.id).in('id', projectIds)
    : { data: [], error: null };
  const projectById = new Map((projects ?? []).map(project => [project.id, project]));
  const years = [...new Set(data.flatMap(item => item.capture_year === null ? [] : [item.capture_year]))].sort((a, b) => b - a);
  const activeYear = year === 'undated' || years.some(value => String(value) === year) ? year : '';
  const matchesYear = (item: (typeof data)[number]) => !activeYear
    || (activeYear === 'undated' ? item.capture_year === null : String(item.capture_year) === activeYear);
  const byIdentity = new Map(data.map(item => [mediaIdentity(item.source_url), item]));
  const galleries = projectIds.flatMap(id => {
    const project = projectById.get(id);
    const frames = websiteGallery(draft, id);
    const sources = kind === 'photo' ? frames.map(frame => frame.url) : [draft.films[id]].filter(Boolean);
    const items = [...new Set(sources.map(mediaIdentity))].flatMap(key => {
      const item = byIdentity.get(key);
      return item && matchesYear(item) ? [item] : [];
    });
    if (!project || !items.length) return [];
    const prefix = draft.name + ' ';
    const suffix = ' — ' + draft.name;
    const title = draft.name && project.title.startsWith(prefix) && project.title.endsWith(suffix)
      ? project.title.slice(prefix.length, -suffix.length) || project.title : project.title;
    return [{ id, title, items, cover: websiteImage(draft.covers[id]) || websiteImage(project.image_url) || websiteImage(frames[0]?.url) }];
  });
  const galleryFilter = selected && (gallery === 'all' || projectById.has(gallery ?? '')) ? gallery : undefined;
  const browseGalleries = Boolean(selected && !galleryFilter);
  const filtered = selected
    ? galleryFilter === 'all' || browseGalleries
      ? [...new Map(galleries.flatMap(group => group.items.map(item => [item.id, item] as const))).values()]
      : galleries.find(group => group.id === galleryFilter)?.items ?? []
    : data.filter(item => (!customSelected || item.category_ids.includes(customSelected.id)) && matchesYear(item));
  const pageSize = 48;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = page && /^\d+$/.test(page) ? Math.min(pages, Math.max(1, Number(page))) : 1;
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filterLink = (name?: string, targetPage = 1, galleryId?: string) => {
    const query = new URLSearchParams();
    if (kind === 'video') query.set('view', 'videos');
    if (name) query.set('collection', name);
    if (galleryId) query.set('gallery', galleryId);
    if (activeYear) query.set('year', activeYear);
    if (targetPage > 1) query.set('page', String(targetPage));
    return '/studio/media' + (query.size ? '?' + query : '');
  };
  const editable = canEditWebsite(role);
  return (
    <StudioShell active="Media" email={user.email}>
      <div className="studio-page-heading"><div><p className="eyebrow">Your portfolio assets</p><h1>Media library</h1><p>Select assets for the page editor, rename files and keep private originals. Selection adds an item to the website picker. Place it on a page and publish to make it visible.</p></div>{canEditWebsite(role) && <div className="website-media-links"><ActionLink className="secondary-button" href="/studio/website?panel=pages">Edit website pages ↗</ActionLink><ActionLink className="secondary-button" href="/studio/import">Import website ↗</ActionLink></div>}</div>
      <nav className="media-tabs" aria-label="Media type">
        <ActionLink aria-current={kind === 'photo' ? 'page' : undefined} href="/studio/media">Photos</ActionLink>
        <ActionLink aria-current={kind === 'video' ? 'page' : undefined} href="/studio/media?view=videos">Videos</ActionLink>
      </nav>
      {(derived.length > 0 || custom.length > 0) && <nav className="media-tabs" aria-label="Media categories">
        <ActionLink href={filterLink()} aria-current={!activeCollection ? 'page' : undefined}>All categories</ActionLink>
        {derived.map(({ name }) => <ActionLink key={name} href={filterLink(name.toLowerCase())} aria-current={selected?.name === name ? 'page' : undefined}>{name}</ActionLink>)}
        {custom.map(({ id, name }) => <ActionLink key={id} href={filterLink(id)} aria-current={customSelected?.id === id ? 'page' : undefined}>{name}</ActionLink>)}
      </nav>}
      <MediaYearFilter key={filterLink(activeCollection, 1, galleryFilter)} kind={kind} collection={activeCollection} gallery={galleryFilter} year={activeYear || ''} years={years} count={filtered.length} />
      {selected && <section className="media-gallery-browser" aria-label={selected.name + ' galleries'}>
        <div className="media-gallery-heading">
          <h2>{galleries.find(group => group.id === galleryFilter)?.title ?? projectById.get(galleryFilter ?? '')?.title ?? (galleryFilter === 'all' ? 'All ' + selected.name + ' media' : selected.name + ' galleries')}</h2>
          {galleryFilter
            ? <ActionLink href={filterLink(activeCollection)}>← All {selected.name} galleries</ActionLink>
            : <ActionLink href={filterLink(activeCollection, 1, 'all')}>View all {kind === 'photo' ? 'photos' : 'videos'} →</ActionLink>}
        </div>
        {browseGalleries && galleries.length > 0 && <div className="media-gallery-grid">{galleries.map(group =>
          <ActionLink className="media-gallery-card" prefetch={false} key={group.id} href={filterLink(activeCollection, 1, group.id)}>
            {group.cover && <img src={group.cover} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            <span><strong>{group.title}</strong><small>{group.items.length} {kind === 'photo' ? (group.items.length === 1 ? 'photo' : 'photos') : (group.items.length === 1 ? 'video' : 'videos')}</small></span>
          </ActionLink>
        )}</div>}
      </section>}
      {projectError && <p role="alert">Gallery names could not be loaded. Try refreshing Media.</p>}
      {!browseGalleries && editable && !categoryError && <MediaOrganisation key={filterLink(activeCollection, currentPage, galleryFilter)} studioId={workspace.id} categories={custom} hasFiles={visible.length > 0} />}
      {categoryError && <p role="alert">Custom categories could not be loaded.</p>}
      {error ? <p role="alert">The library could not load. Please try again later.</p>
        : browseGalleries && galleries.length > 0 ? null
        : visible.length ? <div className="media-grid">{visible.map(item => {
          const embed = item.kind === 'video' ? vimeoEmbed(item.source_url) : null;
          return (
          <article className="studio-panel website-controls" key={item.id}>
            {editable && !categoryError && <label className="rights-check"><input type="checkbox" form="organise-media" name="media" value={item.id} aria-label={'Select ' + item.name + ' for organisation'} /> Select to organise</label>}
            {(item.capture_year || item.category_ids.length > 0) && <p className="media-tags">
              {[item.capture_year, ...item.category_ids.map((id: string) => categoryNames.get(id))].filter(Boolean).join(' · ')}
            </p>}
            {kind === 'photo' && websiteImage(item.source_url) && <img className="media-thumb" src={item.source_url} alt={item.name} loading="lazy" referrerPolicy="no-referrer" />}
            {embed && <p><a href={embed} target="_blank" rel="noreferrer">Watch Vimeo film ↗</a> · Hosted on Vimeo</p>}
            {kind === 'video' && !embed && websiteImage(item.source_url) && <video className="media-thumb" src={item.source_url} controls preload="none" />}
            {!canEditWebsite(role) ? <p>{item.name}</p> : <>
            {!embed && <WebsiteMediaCheckbox id={item.id} selected={item.website_selected} />}
            <form action={renameMedia}>
              <input type="hidden" name="id" value={item.id} />
              <label>Display name<input name="name" defaultValue={item.name} maxLength={150} required /></label>
              <SubmitButton className="secondary-button">Save name</SubmitButton>
            </form>
            {!embed && <MediaExports id={item.id} kind={kind} name={item.name} />}
            </>}
          </article>
        ); })}</div> : <div className="studio-panel"><p>No {kind === 'photo' ? 'photos' : 'videos'}{activeCollection || activeYear ? ' match these filters' : ' in your library yet'}.</p>{canEditWebsite(role) && <Link href="/studio/import">Import from a website ↗</Link>}</div>}
      {!browseGalleries && pages > 1 && <nav className="media-tabs" aria-label="Media pages">
        {currentPage > 1 && <ActionLink href={filterLink(activeCollection, currentPage - 1, galleryFilter)}>← Previous</ActionLink>}
        <span>Page {currentPage} of {pages}</span>
        {currentPage < pages && <ActionLink href={filterLink(activeCollection, currentPage + 1, galleryFilter)}>Next →</ActionLink>}
      </nav>}
    </StudioShell>
  );
}
