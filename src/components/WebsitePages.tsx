'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { orderWebsiteProjects, websiteGallery, type GalleryImage, type Website, type WebsiteMedia, type WebsiteProject } from '@/lib/website';

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || to < 0 || to >= items.length || from < 0 || from >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function WebsitePages({ draft, setDraft, projects, media, page, onPage }: {
  draft: Website; setDraft: Dispatch<SetStateAction<Website>>; projects: WebsiteProject[];
  media: WebsiteMedia[]; page: string; onPage: (page: string) => void;
}) {
  const [picker, setPicker] = useState<'cover' | 'video' | 'gallery' | null>(null);
  const [allMedia, setAllMedia] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (picker) pickerRef.current?.scrollIntoView({ block: 'nearest' });
  }, [picker]);
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState<number | null>(null);
  const ordered = orderWebsiteProjects(projects, draft.projectOrder);
  const project = projects.find(item => item.id === page);
  const gallery = project ? websiteGallery(draft, project.id) : [];
  const cover = project ? draft.covers[project.id] || project.image_url : draft.image;
  const candidates = media.filter(item => item.kind === (picker === 'video' ? 'video' : 'photo'));
  const selectedOnly = !allMedia && candidates.some(item => item.website_selected);
  const visible = candidates.filter(item => (!selectedOnly || item.website_selected) && item.name.toLowerCase().includes(query.toLowerCase()));

  function updateGallery(images: GalleryImage[]) {
    if (project) setDraft(current => ({ ...current, placements: { ...current.placements, [project.id]: images } }));
  }

  function choose(asset: WebsiteMedia) {
    if (picker === 'gallery') updateGallery([...gallery, { url: asset.source_url, size: 'grid', alt: '' }]);
    else if (picker === 'video') setDraft(current => ({ ...current, video: asset.source_url }));
    else if (project) setDraft(current => ({ ...current, covers: { ...current.covers, [project.id]: asset.source_url } }));
    else setDraft(current => ({ ...current, image: asset.source_url, imageAlt: '' }));
    if (picker !== 'gallery' || gallery.length >= 23) setPicker(null);
  }

  return <section className="website-pages" id="page-editor">
    <h2>Pages &amp; media</h2>
    <p>Choose a page to edit and see the changes in the preview. Save a draft to keep your edits, then publish when ready.</p>
    <label>Page<select value={page} onChange={event => { onPage(event.target.value); setPicker(null); }}>
      <option value="home">Homepage</option><option value="about">About + Services</option>
      {ordered.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select></label>

    {page === 'about' ? <>
      <label>About<textarea rows={4} value={draft.about} onChange={event => setDraft({ ...draft, about: event.target.value })} /></label>
      <label>Selected clients (one per line)<textarea rows={3} value={draft.clients} onChange={event => setDraft({ ...draft, clients: event.target.value })} /></label>
      <label>Services<textarea rows={4} value={draft.services} onChange={event => setDraft({ ...draft, services: event.target.value })} /></label>
    </> : <>
      <h3>{project ? 'Campaign cover' : 'Homepage cover'}</h3>
      {cover && <img className="page-editor-cover" src={cover} alt="" referrerPolicy="no-referrer" />}
      <div className="page-editor-actions">
        <button className="secondary-button" onClick={() => setPicker('cover')}>Choose photo</button>
        {project && draft.covers[project.id] && <button className="secondary-button" onClick={() => setDraft({ ...draft, covers: { ...draft.covers, [project.id]: '' } })}>Use project cover</button>}
        {!project && cover && <button className="secondary-button" onClick={() => setDraft({ ...draft, image: '', imageAlt: '' })}>Clear photo</button>}
        {!project && <button className="secondary-button" onClick={() => setPicker('video')}>Choose showreel</button>}
        {!project && draft.video && <button className="secondary-button" onClick={() => setDraft({ ...draft, video: '' })}>Clear showreel</button>}
      </div>
      {picker && <div ref={pickerRef} className="page-media-picker">
        <h3>{picker === 'video' ? 'Choose a video' : 'Choose photos'}</h3>
        <label>Search media<input value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label className="rights-check"><input type="checkbox" checked={allMedia} onChange={event => setAllMedia(event.target.checked)} /> Show all library items</label>
        <div className="page-media-options">
          {visible.map(asset => <button type="button" key={asset.id} disabled={picker === 'gallery' && (gallery.length >= 24 || gallery.some(item => item.url === asset.source_url))} onClick={() => choose(asset)}>
            {asset.kind === 'photo' && <img src={asset.source_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            <span>{asset.name}</span>
          </button>)}
        </div>
        {!visible.length && <p>No matching media. <Link href="/studio/media">Open media library ↗</Link></p>}
        <button className="secondary-button" onClick={() => setPicker(null)}>Done</button>
      </div>}

      {project ? <>
        <h3>Gallery sequence</h3>
        <p>Drag images to reorder them, or use the arrow buttons. Choose a size for each frame.</p>
        <ol className="page-gallery-order">{gallery.map((image, index) => <li key={image.url + index}
          onDragOver={event => { if (dragging !== null) event.preventDefault(); }}
          onDrop={event => { event.preventDefault(); if (dragging !== null) updateGallery(moveItem(gallery, dragging, index)); setDragging(null); }}>
          <img src={image.url} alt="" draggable onDragStart={event => { event.dataTransfer.setData('text/plain', String(index)); setDragging(index); }} onDragEnd={() => setDragging(null)} referrerPolicy="no-referrer" />
          <div><label>Frame {index + 1}<select value={image.size} onChange={event => updateGallery(gallery.map((item, i) => i === index ? { ...item, size: event.target.value as GalleryImage['size'] } : item))}>
            <option value="screen">Full screen</option><option value="wide">Full width</option><option value="grid">Small grid</option>
          </select></label>
          <label>Alt text<input value={image.alt} maxLength={220} onChange={event => updateGallery(gallery.map((item, i) => i === index ? { ...item, alt: event.target.value } : item))} /></label>
          <div className="page-editor-actions">
            <button className="secondary-button" aria-label={'Move frame ' + (index + 1) + ' up'} disabled={index === 0} onClick={() => updateGallery(moveItem(gallery, index, index - 1))}>↑</button>
            <button className="secondary-button" aria-label={'Move frame ' + (index + 1) + ' down'} disabled={index === gallery.length - 1} onClick={() => updateGallery(moveItem(gallery, index, index + 1))}>↓</button>
            <button className="secondary-button" aria-label={'Remove frame ' + (index + 1)} onClick={() => updateGallery(gallery.filter((_, i) => i !== index))}>Remove</button>
          </div></div>
        </li>)}</ol>
        <button className="secondary-button" disabled={gallery.length >= 24} onClick={() => setPicker('gallery')}>Add gallery photos</button>
      </> : <>
        <h3>Campaign order</h3>
        {!ordered.length && <p>Choose which campaigns appear in <Link href="/studio/projects">Projects</Link>.</p>}
        <ol className="page-campaign-order">{ordered.map((item, index) => <li key={item.id}>
          <button className="page-edit-link" onClick={() => { onPage(item.id); setPicker(null); }}>{item.title}</button>
          <button className="secondary-button" aria-label={'Move ' + item.title + ' up'} disabled={index === 0} onClick={() => setDraft({ ...draft, projectOrder: moveItem(ordered, index, index - 1).map(entry => entry.id) })}>↑</button>
          <button className="secondary-button" aria-label={'Move ' + item.title + ' down'} disabled={index === ordered.length - 1} onClick={() => setDraft({ ...draft, projectOrder: moveItem(ordered, index, index + 1).map(entry => entry.id) })}>↓</button>
        </li>)}</ol>
      </>}
    </>}
  </section>;
}
