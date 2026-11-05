import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import WebsiteMediaCheckbox from '@/components/WebsiteMediaCheckbox';
import MediaExports from '@/components/MediaExports';
import { requireStudio } from '@/lib/supabase';
import { websiteImage } from '@/lib/website';
import { renameMedia } from './actions';

export default async function MediaLibrary({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { db, user, workspace, role } = await requireStudio();
  const kind = (await searchParams).view === 'videos' ? 'video' : 'photo';
  const { data, error } = await db.from('studio_media').select('id,name,source_url,kind,website_selected')
    .eq('workspace_id', workspace.id).eq('kind', kind).order('created_at', { ascending: false });
  return (
    <StudioShell active="Media" email={user.email}>
      <div className="studio-page-heading"><div><p className="eyebrow">Your portfolio assets</p><h1>Media library</h1><p>Select assets for the page editor, rename files and keep private originals. Selection adds an item to the website picker. Place it on a page and publish to make it visible.</p></div>{role !== 'viewer' && <div className="website-media-links"><Link className="secondary-button" href="/studio/website#page-editor">Edit website pages ↗</Link><Link className="secondary-button" href="/studio/import">Import website ↗</Link></div>}</div>
      <nav className="media-tabs" aria-label="Media type">
        <Link aria-current={kind === 'photo' ? 'page' : undefined} href="/studio/media">Photos</Link>
        <Link aria-current={kind === 'video' ? 'page' : undefined} href="/studio/media?view=videos">Videos</Link>
      </nav>
      {error ? <p role="alert">The library could not load. Please try again later.</p>
        : data?.length ? <div className="media-grid">{data.map(item => (
          <article className="studio-panel website-controls" key={item.id}>
            {kind === 'photo' && websiteImage(item.source_url) && <img className="media-thumb" src={item.source_url} alt={item.name} loading="lazy" referrerPolicy="no-referrer" />}
            {kind === 'video' && websiteImage(item.source_url) && <video className="media-thumb" src={item.source_url} controls preload="none" />}
            {role === 'viewer' ? <p>{item.name}</p> : <>
            <WebsiteMediaCheckbox id={item.id} selected={item.website_selected} />
            <form action={renameMedia}>
              <input type="hidden" name="id" value={item.id} />
              <label>Display name<input name="name" defaultValue={item.name} maxLength={150} required /></label>
              <button className="secondary-button">Save name</button>
            </form>
            <MediaExports id={item.id} kind={kind} name={item.name} />
            </>}
          </article>
        ))}</div> : <div className="studio-panel"><p>No {kind === 'photo' ? 'photos' : 'videos'} in your library yet.</p>{role !== 'viewer' && <Link href="/studio/import">Import from a website ↗</Link>}</div>}
    </StudioShell>
  );
}
