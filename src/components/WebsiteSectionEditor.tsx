'use client';

import { useState } from 'react';
import { sectionLayouts, type WebsiteSection } from '@/lib/website-sections';
import type { WebsiteMedia, WebsiteProject } from '@/lib/website';

export default function WebsiteSectionEditor({ sections, media, projects, page, onChange }: {
  sections: WebsiteSection[]; media: WebsiteMedia[]; projects: WebsiteProject[]; page: string; onChange: (sections: WebsiteSection[]) => void;
}) {
  const [picker, setPicker] = useState('');
  const [query, setQuery] = useState('');
  const photos = media.filter(asset => asset.kind === 'photo' && asset.name.toLowerCase().includes(query.toLowerCase()));
  function update(id: string, patch: Partial<WebsiteSection>) {
    onChange(sections.map(section => section.id === id ? { ...section, ...patch } : section));
  }
  function move(index: number, target: number) {
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return <section className="website-section-editor">
    <h3>Page sections</h3>
    <p>Add a layout, write your copy, and choose an image. Sections appear in this order above the photo gallery.</p>
    <div className="section-layout-picker">
      {sectionLayouts.map(([layout, label, description]) => <button key={layout} type="button" className="secondary-button" disabled={sections.length >= 24}
        onClick={() => onChange([...sections, { id: crypto.randomUUID(), layout, heading: '', text: '', image: '', alt: '', link: '' }])}>
        <strong>{label}</strong><small>{description}</small>
      </button>)}
    </div>
    {sections.map((section, index) => <details key={section.id} className="website-section-card" open>
      <summary>{index + 1}. {section.heading || sectionLayouts.find(([layout]) => layout === section.layout)?.[1]}</summary>
      <div className="design-switch" aria-label={'Layout for section ' + (index + 1)}>
        {sectionLayouts.map(([layout, label]) => <button key={layout} type="button" aria-pressed={section.layout === layout}
          onClick={() => update(section.id, { layout })}>{label}</button>)}
      </div>
      <label>Heading<input value={section.heading} maxLength={140} onChange={event => update(section.id, { heading: event.target.value })} /></label>
      <label>Text<textarea rows={3} value={section.text} maxLength={1800} onChange={event => update(section.id, { text: event.target.value })} /></label>
      {section.layout !== 'text' && <>
        {section.image && <img className="page-editor-cover" src={section.image} alt="" referrerPolicy="no-referrer" />}
        <div className="page-editor-actions">
          <button type="button" className="secondary-button" onClick={() => { setQuery(''); setPicker(picker === section.id ? '' : section.id); }}>{section.image ? 'Replace photo' : 'Choose photo'}</button>
          {section.image && <button type="button" className="secondary-button" onClick={() => update(section.id, { image: '', alt: '' })}>Clear photo</button>}
        </div>
        {picker === section.id && <div className="page-media-picker">
          <label>Search Media<input value={query} onChange={event => setQuery(event.target.value)} /></label>
          <div className="page-media-options">{photos.map(asset => <button type="button" key={asset.id} onClick={() => {
            update(section.id, { image: asset.source_url, alt: '' });
            setPicker('');
          }}><img src={asset.source_url} alt="" loading="lazy" referrerPolicy="no-referrer" /><span>{asset.name}</span></button>)}</div>
          {!photos.length && <p>No matching photos.</p>}
        </div>}
        {section.image && <label>Image description<input value={section.alt} maxLength={220} onChange={event => update(section.id, { alt: event.target.value })} /></label>}
      </>}
      <label>Link to a campaign<select value={section.link} onChange={event => update(section.id, { link: event.target.value })}>
        <option value="">No link</option>{projects.filter(project => project.id !== page).map(project => <option key={project.id} value={project.id}>{project.title}</option>)}
      </select></label>
      <div className="page-editor-actions">
        <button type="button" className="secondary-button" disabled={index === 0} onClick={() => move(index, index - 1)}>Move up</button>
        <button type="button" className="secondary-button" disabled={index === sections.length - 1} onClick={() => move(index, index + 1)}>Move down</button>
        <button type="button" className="secondary-button" onClick={() => onChange(sections.filter(item => item.id !== section.id))}>Remove section</button>
      </div>
    </details>)}
  </section>;
}
