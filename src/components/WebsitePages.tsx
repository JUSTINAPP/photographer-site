'use client';
import HomepageMotion from './HomepageMotion';
import PageOpeningEditor from './PageOpeningEditor';
import {motionSeconds} from '@/lib/home-motion';
import ImportNavigation from './ImportNavigation';
import SmartImage from '@/components/SmartImage';


import { normaliseTheme, PRESETS } from '@/lib/website-theme';
import { mediaIdentity, vimeoEmbed } from '@/lib/import-identity';

import { ActionButton } from '@/components/ActionFeedback';

import { useEffect, useRef, useState, useTransition, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { createCampaignPage } from '@/app/studio/website/actions';
import WebsiteSectionEditor from './WebsiteSectionEditor';
import RestoreWebsitePages from './RestoreWebsitePages';
import { homepageWork, orderWebsiteProjects, websiteGallery, type GalleryImage, type Website, type WebsiteMedia, type WebsiteProject } from '@/lib/website';

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || to < 0 || to >= items.length || from < 0 || from >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function WebsitePages({ studioId, draft, setDraft, projects, onProjects, media, page, onPage, onOpening, openingPreview }: {
  onOpening:()=>void; openingPreview?:import('@/lib/home-motion').HomeMotion;
  studioId: string; onProjects: (projects: WebsiteProject[]) => void;
  draft: Website; setDraft: Dispatch<SetStateAction<Website>>; projects: WebsiteProject[];
  media: WebsiteMedia[]; page: string; onPage: (page: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const [picker, setPicker] = useState<'cover' | 'video' | 'gallery' | null>(null);
  const [allMedia, setAllMedia] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (picker) pickerRef.current?.scrollIntoView({ block: 'nearest' });
  }, [picker]);
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState<number | null>(null);
  const ordered = orderWebsiteProjects(projects, draft.projectOrder);
  const campaign = draft.theme.layout === 'campaign';
  const included = new Set(homepageWork(draft, projects).map(item => item.id));
  const project = projects.find(item => item.id === page);
  const gallery = project ? websiteGallery(draft, project.id) : draft.homeGallery ?? [];
  const galleryLimit = project ? 100 : 150;
  const cover = project ? draft.covers[project.id] || project.image_url : draft.image;
  const candidates = media.filter(item => picker === 'video' ? item.kind === 'video' && !vimeoEmbed(item.source_url) : item.kind === 'photo');
  const selectedOnly = !allMedia && candidates.some(item => item.website_selected);
  const visible = candidates.filter(item => (!selectedOnly || item.website_selected) && item.name.toLowerCase().includes(query.toLowerCase()));

  function updateGallery(images: GalleryImage[]) {
    setDraft(current => project
      ? { ...current, placements: { ...current.placements, [project.id]: images } }
      : { ...current, homeGallery: images });
  }

  function restore(home: string[], pages: { id: string; photos: string[] }[], restored: WebsiteProject[]) {
    onProjects(restored);
    setDraft(current => {
      const frames = (urls: string[], previous: GalleryImage[]) => urls.map(url =>
        previous.find(image => image.url === url) ?? { url, size: 'grid' as const, alt: '' });
      const onSourcePages = new Set(pages.flatMap(entry => entry.photos));
      const remaining = (current.homeGallery ?? []).filter(image => !home.includes(image.url) && (!home.length || !onSourcePages.has(image.url)));
      const homeGallery = [...frames(home, current.homeGallery ?? []), ...remaining].slice(0, 150);
      const placements = { ...current.placements };
      for (const entry of pages) {
        if (!Object.hasOwn(placements, entry.id) && !Object.hasOwn(current.galleries, entry.id)) {
          placements[entry.id] = frames(entry.photos.slice(0, 100), []);
        }
      }
      const ids = pages.map(entry => entry.id);
      const included = homepageWork(current, restored).map(item => item.id);
      return {
        ...current,
        image: current.image || homeGallery[0]?.url || '',
        homeGallery, placements,
        homepageProjects: [...new Set([...included, ...ids])],
        projectOrder: [...new Set([...current.projectOrder, ...ids])],
      };
    });
    onPage('home');
    setPicker(null);
  }

  function rebuild(result: Parameters<React.ComponentProps<typeof RestoreWebsitePages>['onRebuild']>[0]) {
    onProjects(result.projects);
    setDraft(current => {
      const placements = { ...current.placements };
      const collections = { ...current.collections };
      const films = { ...current.films };
      for (const entry of result.pages) {
        collections[entry.id] = entry.category;
        if (entry.film && !films[entry.id]) films[entry.id] = entry.film;
        const hasGallery = Object.hasOwn(placements, entry.id) || Object.hasOwn(current.galleries, entry.id);
        if (!hasGallery || result.fillGaps) {
          const frames = hasGallery ? websiteGallery(current, entry.id) : [];
          const used = new Set(frames.map(frame => mediaIdentity(frame.url)));
          const additions = entry.photos.filter(url => !used.has(mediaIdentity(url))).map(url => ({ url, size: 'grid' as const, alt: '' }));
          if (!hasGallery || additions.length) placements[entry.id] = [...frames, ...additions].slice(0, 100);
        }
      }
      const ids = result.pages.map(entry => entry.id);
      const included = homepageWork(current, result.projects).map(item => item.id);
      return {
        ...current, placements, collections, films,
        theme: current.theme.layout === 'campaign' ? current.theme : normaliseTheme(PRESETS.campaign.theme),
        image: current.image || result.pages.find(entry => entry.photos.length)?.photos[0] || '',
        instagram: current.instagram || result.instagram,
        homeGallery: current.homeGallery ?? [],
        homepageProjects: [...new Set([...ids, ...included])].slice(0, 150),
        projectOrder: [...new Set([...ids, ...current.projectOrder])].slice(0, 150),
      };
    });
    onPage('home');
    setPicker(null);
  }

  function choose(asset: WebsiteMedia) {
    if (picker === 'gallery') updateGallery([...gallery, { url: asset.source_url, size: 'grid', alt: '' }]);
    else if (picker === 'video') setDraft(current => ({ ...current, video: asset.source_url }));
    else if (project) setDraft(current => ({ ...current, covers: { ...current.covers, [project.id]: asset.source_url } }));
    else setDraft(current => ({ ...current, image: asset.source_url, imageAlt: '' }));
    if (picker !== 'gallery' || gallery.length >= galleryLimit - 1) setPicker(null);
  }

  return <section className="website-pages" id="page-editor">
    <h2>Edit website pages</h2>
    <p>Choose a page to edit and see the changes in the preview. Save a draft to keep your edits, then publish when ready.</p>
    <button type="button" className="primary-button" aria-expanded={creating} onClick={() => { setCreating(!creating); setMessage(''); }}>+ Add page</button>
    {creating && <form className="website-section-card" onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      setMessage('');
      startTransition(async () => {
        try {
          const result = await createCampaignPage(studioId, {
            title: String(fields.get('title')), category: String(fields.get('category')), description: String(fields.get('description')),
          });
          if (!result.project) { setMessage(result.error || 'Could not create the page.'); return; }
          const added=result.project;onProjects([...projects,added]);
          setDraft(current=>({...current,projectOrder:[...current.projectOrder,added.id],homepageProjects:[...new Set([...homepageWork(current,projects).map(project=>project.id),added.id])],navigation:current.navigation.length?[...current.navigation,{label:added.title,page:added.id,href:''}]:current.navigation}));
          onPage(result.project.id);
          setPicker(null);
          setCreating(false);
        } catch { setMessage('Could not create the page. Please try again.'); }
      });
    }}>
      <label>Page name<input name="title" required maxLength={180} /></label>
      <label>Category<input name="category" placeholder="Fashion, nautical or lifestyle" maxLength={80} /></label>
      <label>Page introduction<textarea name="description" rows={3} maxLength={2000} /></label>
      <ActionButton busy={pending} className="secondary-button" disabled={pending}>{pending ? 'Creating…' : 'Create page'}</ActionButton>
      {message && <p role="status">{message}</p>}
    </form>}
    <nav className="website-page-list" aria-label="Pages">
      {[{ id: 'home', title: 'Homepage' }, { id: 'about', title: 'About + Services' }, ...ordered].map(item =>
        <button type="button" key={item.id} aria-current={page === item.id ? 'page' : undefined}
          onClick={() => { onPage(item.id); setPicker(null); }}>{draft.navigation.find(link=>link.page===item.id)?.label||item.title}</button>)}
    </nav>
    <ImportNavigation projects={projects} studioId={studioId} draft={draft} onChange={patch=>setDraft(current=>({...current,...patch}))} onProjects={onProjects}/>
    {draft.hiddenBlocks.length>0&&<details><summary>Removed sections ({draft.hiddenBlocks.length})</summary><p>Removed from this website only. Restore any section below.</p>{draft.hiddenBlocks.map(id=><button type="button" className="secondary-button" key={id} onClick={()=>setDraft(current=>({...current,hiddenBlocks:current.hiddenBlocks.filter(key=>key!==id)}))}>Restore {id.split(':').pop()?.replaceAll('-',' ')}</button>)}</details>}
    <RestoreWebsitePages id={studioId} source={draft.currentWebsite} onRestore={restore} onRebuild={rebuild} />
    <h3>Editing {project?.title || (page === 'about' ? 'About + Services' : 'Homepage')}</h3>

    {page !== 'about' && <details><summary>Extra sections and layouts</summary>
    <WebsiteSectionEditor key={page} page={page} sections={draft.sections[page] ?? []} media={media} projects={projects}
      onChange={sections => setDraft(current => ({ ...current, sections: { ...current.sections, [page]: sections } }))} />
    </details>}
    {page === 'about' ? <>
      <div className="about-page-fields"><h3>About page text</h3><p>Click and type directly in the preview, or use these matching fields. Each heading and label is editable.</p>
      <label>Small label above the title<input maxLength={100} value={draft.aboutLabel} onChange={e=>setDraft(current=>({...current,aboutLabel:e.target.value}))}/></label>
      <label>About page title<input maxLength={140} value={draft.aboutTitle || draft.name} onChange={e=>setDraft(current=>({...current,aboutTitle:e.target.value}))}/></label>
      <label>Biography<textarea maxLength={2500} rows={6} value={draft.about} onChange={e=>setDraft(current=>({...current,about:e.target.value}))}/></label>
      <label>Clients heading<input maxLength={100} value={draft.clientsHeading} onChange={e=>setDraft(current=>({...current,clientsHeading:e.target.value}))}/></label>
      <label>Client names (one per line)<textarea maxLength={2000} rows={4} value={draft.clients} onChange={e=>setDraft(current=>({...current,clients:e.target.value}))}/></label>
      <label>Small label above services<input maxLength={100} value={draft.servicesLabel} onChange={e=>setDraft(current=>({...current,servicesLabel:e.target.value}))}/></label>
      <label>Services heading<input maxLength={140} value={draft.servicesHeading} onChange={e=>setDraft(current=>({...current,servicesHeading:e.target.value}))}/></label>
      <label>Services description<textarea maxLength={1500} rows={5} value={draft.services} onChange={e=>setDraft(current=>({...current,services:e.target.value}))}/></label>
      </div>
      <details><summary>Extra page sections</summary>
    <WebsiteSectionEditor key={page} page={page} sections={draft.sections[page] ?? []} media={media} projects={projects}
      onChange={sections => setDraft(current => ({ ...current, sections: { ...current.sections, [page]: sections } }))} />
      </details>
    </> : <>
      {!project && <><label>Opening label<input value={draft.heroLabel} maxLength={100} onChange={e=>setDraft(current=>({...current,heroLabel:e.target.value}))}/></label><label>Introduction label<input value={draft.introLabel} maxLength={100} onChange={e=>setDraft(current=>({...current,introLabel:e.target.value}))}/></label><label>Homepage introduction<textarea value={draft.introText} maxLength={2500} onChange={e=>setDraft(current=>({...current,introText:e.target.value}))}/></label><label>Homepage headline<input maxLength={220} value={draft.headline} onChange={event => setDraft({ ...draft, headline: event.target.value })} /></label></>}
      {!project && draft.motion.enabled && draft.motion.clips.length>0 && <div className="opening-selection"><h3>Selected homepage opening · video edit</h3><p>{draft.motion.clips.length} shots · {motionSeconds(draft.motion)} seconds. {draft.hiddenBlocks.includes('home:opening')?'The opening section is currently removed. Restore it above to show this video.':'This is the opening playing in your page preview.'}</p>{openingPreview?.desktopUrl?<video src={openingPreview.desktopUrl} controls muted playsInline preload="metadata"/>:<div style={{height:180,position:'relative',overflow:'hidden'}}><HomepageMotion motion={openingPreview||draft.motion} poster={draft.image} preview/></div>}<div className="page-editor-actions"><button type="button" className="primary-button" onClick={onOpening}>Edit this opening</button><button type="button" className="secondary-button" onClick={()=>setDraft(current=>({...current,motion:{...current.motion,enabled:false},video:''}))}>Use a still photo instead</button></div></div>}
      {!project && !draft.motion.enabled && draft.video && <div className="opening-selection"><h3>Selected homepage opening · showreel</h3><video controls muted playsInline src={draft.video} preload="metadata"/><button type="button" className="secondary-button" onClick={()=>setPicker('video')}>Replace showreel</button><button type="button" className="secondary-button" onClick={()=>setDraft(current=>({...current,video:''}))}>Use a still photo instead</button></div>}
      {!project && !draft.motion.enabled && !draft.video && draft.motion.clips.length>0 && <button type="button" className="secondary-button" onClick={()=>setDraft(current=>({...current,motion:{...current.motion,enabled:true}}))}>Use my saved opening video</button>}
      {project&&<PageOpeningEditor site={draft} page={project.id} media={media} onChange={setDraft}/>}
      <label>Gallery layout<select value={draft.galleryLayouts[page]||'grid'} onChange={e=>setDraft(current=>({...current,galleryLayouts:{...current.galleryLayouts,[page]:e.target.value as 'grid'|'natural'}}))}><option value="grid">Uniform cropped grid</option><option value="natural">Original proportions · masonry</option></select></label>
      <h3>{project ? 'Project cover' : draft.motion.enabled || draft.video ? 'Loading poster · shown before your video starts' : 'Homepage opening · still photo'}</h3>
      {(project || (!draft.motion.enabled && !draft.video)) && cover && <SmartImage variant="thumb" className="page-editor-cover" src={cover} alt="" referrerPolicy="no-referrer" />}
      <div className="page-editor-actions">
        <button className="secondary-button" onClick={() => setPicker('cover')}>{!project&&(draft.motion.enabled||draft.video)?'Change loading poster':'Choose photo'}</button>
        {project && draft.covers[project.id] && <button className="secondary-button" onClick={() => setDraft({ ...draft, covers: { ...draft.covers, [project.id]: '' } })}>Use project cover</button>}
        {!project && cover && <button className="secondary-button" onClick={() => setDraft({ ...draft, image: '', imageAlt: '' })}>{draft.motion.enabled||draft.video?'Clear loading poster':'Clear photo'}</button>}
        {!draft.motion.enabled && !project && <button className="secondary-button" onClick={() => setPicker('video')}>Choose showreel</button>}
        {!draft.motion.enabled && !project && draft.video && <button className="secondary-button" onClick={() => setDraft({ ...draft, video: '' })}>Clear showreel</button>}
      </div>
      {picker && <div ref={pickerRef} className="page-media-picker">
        <h3>{picker === 'video' ? 'Choose a video' : 'Choose photos'}</h3>
        <label>Search media<input value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label className="rights-check"><input type="checkbox" checked={allMedia} onChange={event => setAllMedia(event.target.checked)} /> Show all library items</label>
        <div className="page-media-options">
          {visible.map(asset => <button type="button" key={asset.id} disabled={picker === 'gallery' && (gallery.length >= galleryLimit || gallery.some(item => item.url === asset.source_url))} onClick={() => choose(asset)}>
            {asset.kind === 'photo' && <SmartImage variant="thumb" src={asset.source_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            <span>{asset.name}</span>
          </button>)}
        </div>
        {!visible.length && <p>No matching media. <Link href="/studio/media">Open media library ↗</Link></p>}
        <button className="secondary-button" onClick={() => setPicker(null)}>Done</button>
      </div>}

      <>
        <h3>{project ? 'Project gallery' : 'Homepage photo gallery'}</h3>
        <p>{gallery.length} photos. Drag photos or use the arrows to reorder them. Change the size of any frame.</p>
        <button className="secondary-button" disabled={gallery.length >= galleryLimit} onClick={() => setPicker('gallery')}>Add photos from Media</button>
        {!gallery.length && <p>No photos on this page yet.</p>}
        <ol className="page-gallery-order">{gallery.map((image, index) => <li key={image.url + index}
          onDragOver={event => { if (dragging !== null) event.preventDefault(); }}
          onDrop={event => { event.preventDefault(); if (dragging !== null) updateGallery(moveItem(gallery, dragging, index)); setDragging(null); }}>
          <SmartImage variant="thumb" src={image.url} alt="" draggable onDragStart={event => { event.dataTransfer.setData('text/plain', String(index)); setDragging(index); }} onDragEnd={() => setDragging(null)} referrerPolicy="no-referrer" />
          <div><strong>Frame {index + 1}</strong>
          <div className="design-switch frame-size-options" aria-label={'Size of frame ' + (index + 1)}>
            {([['grid', 'Grid'], ['wide', 'Full width'], ['screen', 'Full screen']] as const).map(([size, label]) =>
              <button type="button" key={size} aria-pressed={image.size === size}
                onClick={() => updateGallery(gallery.map((item, i) => i === index ? { ...item, size } : item))}>{label}</button>
            )}
          </div>
          <label>Alt text<input value={image.alt} maxLength={220} onChange={event => updateGallery(gallery.map((item, i) => i === index ? { ...item, alt: event.target.value } : item))} /></label>
          <label>Link photo to a campaign<select value={image.link ?? ''} onChange={event => updateGallery(gallery.map((item, i) =>
            i === index ? { ...item, link: event.target.value || undefined } : item))}>
            <option value="">No link</option>{projects.filter(item => item.id !== page).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select></label>
          <div className="page-editor-actions">
            <button className="secondary-button" aria-label={'Move frame ' + (index + 1) + ' up'} disabled={index === 0} onClick={() => updateGallery(moveItem(gallery, index, index - 1))}>↑</button>
            <button className="secondary-button" aria-label={'Move frame ' + (index + 1) + ' down'} disabled={index === gallery.length - 1} onClick={() => updateGallery(moveItem(gallery, index, index + 1))}>↓</button>
            <button className="secondary-button" aria-label={'Remove frame ' + (index + 1)} onClick={() => updateGallery(gallery.filter((_, i) => i !== index))}>Remove</button>
          </div></div>
        </li>)}</ol>
      </>
      {project && <section className="website-section-editor">
        <h3>More work</h3>
        <p>Choose which campaign squares appear at the bottom. Tick them in the order you want visitors to see them.</p>
        {ordered.filter(item => item.id !== project.id).map(item => {
          const selection = draft.related[project.id] ?? [...included].filter(id => id !== project.id);
          return <label className="rights-check" key={item.id}><input type="checkbox" checked={selection.includes(item.id)} onChange={event => {
            const next = event.target.checked ? [...selection, item.id] : selection.filter(id => id !== item.id);
            setDraft({ ...draft, related: { ...draft.related, [project.id]: next } });
          }} />{selection.includes(item.id) ? (selection.indexOf(item.id) + 1) + '. ' : ''}{item.title}</label>;
        })}
        {!ordered.some(item => item.id !== project.id) && <p>Add another campaign page to link to it here.</p>}
      </section>}
      {!project && <>
        <h3>What appears on the homepage</h3>
        {campaign && <label className="rights-check"><input type="checkbox" checked={draft.showIntro} onChange={event => setDraft({ ...draft, showIntro: event.target.checked })} /> Show introduction below the cover</label>}
        <div className="design-switch" aria-label="Selected work layout">
          <button type="button" aria-pressed={draft.homepageLayout === 'full'} onClick={() => setDraft({ ...draft, homepageLayout: 'full' })}>{campaign ? 'Full-screen tiles' : 'Full width'}</button>
          <button type="button" aria-pressed={draft.homepageLayout === 'grid'} onClick={() => setDraft({ ...draft, homepageLayout: 'grid' })}>Grid</button>
        </div>
        <h3>Projects on the homepage</h3>
        <p>Tick the projects you want to include. Use the arrows to set their order and click a title to change its cover or gallery.</p>
        {!ordered.length && <p>Add or import work from <Link href="/studio/projects">Projects</Link>.</p>}
        <ol className="page-campaign-order">{ordered.map((item, index) => <li key={item.id}>
          <input type="checkbox" aria-label={'Include ' + item.title + ' on homepage'} checked={included.has(item.id)} onChange={event => {
            const next = new Set(included);
            if (event.target.checked) next.add(item.id); else next.delete(item.id);
            setDraft({ ...draft, homepageProjects: [...next] });
          }} />
          {(draft.covers[item.id] || item.image_url) && <SmartImage variant="thumb" className="homepage-project-thumb" src={draft.covers[item.id] || item.image_url!} alt="" loading="lazy" referrerPolicy="no-referrer" />}
          <button className="page-edit-link" onClick={() => { onPage(item.id); setPicker(null); }}>{item.title}</button>
          <button className="secondary-button" aria-label={'Move ' + item.title + ' up'} disabled={index === 0} onClick={() => setDraft({ ...draft, projectOrder: moveItem(ordered, index, index - 1).map(entry => entry.id) })}>↑</button>
          <button className="secondary-button" aria-label={'Move ' + item.title + ' down'} disabled={index === ordered.length - 1} onClick={() => setDraft({ ...draft, projectOrder: moveItem(ordered, index, index + 1).map(entry => entry.id) })}>↓</button>
        </li>)}</ol>
      </>}
    </>}
  </section>;
}
