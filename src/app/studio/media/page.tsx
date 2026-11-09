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

export default async function MediaLibrary({ searchParams }: { searchParams: Promise<{ view?: string; collection?: string }> }) {
  const { db, user, workspace, role } = await requireStudio();
  const { view, collection } = await searchParams;
  const kind = view === 'videos' ? 'video' : 'photo';
  const [{ data, error }, { data: website }] = await Promise.all([
    db.from('studio_media').select('id,name,source_url,kind,website_selected')
      .eq('workspace_id', workspace.id).eq('kind', kind).order('created_at', { ascending: false }),
    db.from('studio_websites').select('draft').eq('workspace_id', workspace.id).maybeSingle(),
  ]);
  const draft = normaliseWebsite(website?.draft);
  const categories = portfolioCollections.filter(({ name }) => Object.values(draft.collections).includes(name));
  const selected = categories.find(({ name }) => name.toLowerCase() === collection);
  const assigned = new Set(Object.entries(draft.collections)
    .filter(([, name]) => name === selected?.name)
    .flatMap(([id]) => kind === 'photo' ? websiteGallery(draft, id).map(frame => frame.url) : draft.films[id] ? [draft.films[id]] : [])
    .map(mediaIdentity));
  const visible = selected ? data?.filter(item => assigned.has(mediaIdentity(item.source_url))) : data;
  const filterLink = (name?: string) => {
    const query = new URLSearchParams();
    if (kind === 'video') query.set('view', 'videos');
    if (name) query.set('collection', name.toLowerCase());
    return '/studio/media' + (query.size ? '?' + query : '');
  };
  return (
    <StudioShell active="Media" email={user.email}>
      <div className="studio-page-heading"><div><p className="eyebrow">Your portfolio assets</p><h1>Media library</h1><p>Select assets for the page editor, rename files and keep private originals. Selection adds an item to the website picker. Place it on a page and publish to make it visible.</p></div>{canEditWebsite(role) && <div className="website-media-links"><ActionLink className="secondary-button" href="/studio/website?panel=pages">Edit website pages ↗</ActionLink><ActionLink className="secondary-button" href="/studio/import">Import website ↗</ActionLink></div>}</div>
      <nav className="media-tabs" aria-label="Media type">
        <Link aria-current={kind === 'photo' ? 'page' : undefined} href="/studio/media">Photos</Link>
        <Link aria-current={kind === 'video' ? 'page' : undefined} href="/studio/media?view=videos">Videos</Link>
      </nav>
      {categories.length > 0 && <nav className="media-tabs" aria-label="Website collections">
        <Link href={filterLink()} aria-current={!selected ? 'page' : undefined}>All collections</Link>
        {categories.map(({ name }) => <Link key={name} href={filterLink(name)} aria-current={selected?.name === name ? 'page' : undefined}>{name}</Link>)}
      </nav>}
      {error ? <p role="alert">The library could not load. Please try again later.</p>
        : visible?.length ? <div className="media-grid">{visible.map(item => {
          const embed = item.kind === 'video' ? vimeoEmbed(item.source_url) : null;
          return (
          <article className="studio-panel website-controls" key={item.id}>
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
        ); })}</div> : <div className="studio-panel"><p>No {kind === 'photo' ? 'photos' : 'videos'}{selected ? ' in ' + selected.name : ' in your library yet'}.</p>{canEditWebsite(role) && <Link href="/studio/import">Import from a website ↗</Link>}</div>}
    </StudioShell>
  );
}
