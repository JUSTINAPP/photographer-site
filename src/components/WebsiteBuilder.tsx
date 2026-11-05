'use client';

import Link from 'next/link';
import { useState, useTransition, type CSSProperties } from 'react';
import { saveWebsite } from '@/app/studio/website/actions';
import { FONT_PAIRS, HEADERS, PALETTES, PRESETS, normaliseTheme, themeVars, type SiteTheme } from '@/lib/website-theme';
import { normaliseWebsite, type Website, type WebsiteProject } from '@/lib/website';
import EditorialWebsite from './EditorialWebsite';

const contentFields = [
  ['name', 'Portfolio name'], ['headline', 'Opening headline'],
  ['image', 'Cover image URL'], ['imageAlt', 'Cover image description'],
  ['email', 'Public enquiry email'], ['about', 'About'], ['services', 'Services'],
] as const;

export default function WebsiteBuilder({ initial, projects, publicId, isPublished }: {
  initial: Website; projects: WebsiteProject[]; publicId?: string; isPublished: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [live, setLive] = useState(isPublished);
  const [id, setId] = useState(publicId);
  const [notice, setNotice] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  function updateTheme(changes: Partial<SiteTheme>) {
    setDraft(current => ({ ...current, theme: { ...current.theme, ...changes } }));
  }

  function save(mode: 'draft' | 'publish' | 'unpublish') {
    setNotice('');
    startTransition(async () => {
      try {
        const result = await saveWebsite(draft, mode);
        if (result.error) { setNotice(result.error); return; }
        setLive(!!result.published);
        setId(result.id);
        setConfirmed(false);
        setNotice(mode === 'publish' ? 'Website published.' : mode === 'unpublish' ? 'Website taken offline. Your draft is saved.' : 'Draft saved.');
      } catch {
        setNotice('The website could not be saved. Check your connection and sign-in.');
      }
    });
  }

  return (
    <div className="website-builder">
      <section className="studio-panel website-controls">
        <h2>Content</h2>
        {contentFields.map(([key, label]) => (
          <label key={key}>
            {label}
            {key === 'about' || key === 'services'
              ? <textarea value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} rows={4} />
              : <input type={key === 'email' ? 'email' : key === 'image' ? 'url' : 'text'} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />}
          </label>
        ))}
        <h2>Design</h2>
        <h3>Choose a template</h3>
        <div className="template-options">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const theme = normaliseTheme(preset.theme);
            const active = ['fonts', 'palette', 'header', 'hero'].every(field =>
              theme[field as keyof SiteTheme] === draft.theme[field as keyof SiteTheme]);
            return <button className="template-option" key={key} aria-pressed={active}
              style={{ ...themeVars(theme), background: 'var(--color-site)', color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' } as CSSProperties}
              onClick={() => setDraft(current => ({ ...current, theme }))}>
              {preset.label}
              <img src={key === 'darkroom' ? '/images/sailing.jpg' : '/images/fashion.jpg'} alt="" />
              <small>{key === 'editorial' ? 'Split introduction' : key === 'whitecube' ? 'Framed photography' : 'Full-width opening'}</small>
            </button>;
          })}
        </div>
        <label>Typography
          <select value={draft.theme.fonts} onChange={e => updateTheme({ fonts: e.target.value as SiteTheme['fonts'] })}>
            {Object.entries(FONT_PAIRS).map(([key, font]) => <option key={key} value={key}>{font.label}</option>)}
          </select>
        </label>
        <label>Palette
          <select value={draft.theme.palette} onChange={e => updateTheme({ palette: e.target.value as SiteTheme['palette'] })}>
            {Object.entries(PALETTES).map(([key, palette]) => <option key={key} value={key}>{palette.label}</option>)}
            <option value="custom">Custom</option>
          </select>
        </label>
        {draft.theme.palette === 'custom' && <div className="website-colours">
          <label>Background<input type="color" value={draft.theme.bg} onChange={e => updateTheme({ bg: e.target.value })} /></label>
          <label>Text<input type="color" value={draft.theme.ink} onChange={e => updateTheme({ ink: e.target.value })} /></label>
        </div>}
        <label>Header
          <select value={draft.theme.header} onChange={e => updateTheme({ header: e.target.value as SiteTheme['header'] })}>
            {HEADERS.map(header => <option key={header}>{header}</option>)}
          </select>
        </label>
        <label>Opening layout
          <select value={draft.theme.hero} onChange={e => updateTheme({ hero: e.target.value as SiteTheme['hero'] })}>
            <option value="full">Full-width image</option><option value="split">Split editorial</option>
            <option value="framed">Framed image</option><option value="text">Text only</option>
          </select>
        </label>
        <h2>Publishing</h2>
        <p>Add or import work from <Link href="/studio/projects">Projects</Link>. Only published projects appear on your site.</p>
        <button className="secondary-button" disabled={pending} onClick={() => save('draft')}>Save draft</button>
        <label className="rights-check"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> I have permission to publish this content.</label>
        <button className="primary-button" disabled={pending || !confirmed} onClick={() => save('publish')}>{live ? 'Publish changes' : 'Publish website'}</button>
        {live && id && <p><Link href={'/sites/' + id}>Open published website ↗</Link></p>}
        {live && <button className="secondary-button" disabled={pending} onClick={() => save('unpublish')}>Take website offline</button>}
        <p role="status">{pending ? 'Saving…' : notice}</p>
      </section>
      <section className="website-preview" aria-label="Website preview">
        <p className="eyebrow">Live draft preview</p>
        <EditorialWebsite site={normaliseWebsite(draft)} projects={projects} preview />
      </section>
    </div>
  );
}
