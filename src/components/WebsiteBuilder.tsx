'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition, type CSSProperties } from 'react';
import { saveWebsite } from '@/app/studio/website/actions';
import { FONT_PAIRS, HEADERS, PALETTES, PRESETS, normaliseTheme, themeVars, type SiteTheme } from '@/lib/website-theme';
import { normaliseWebsite, type Website, type WebsiteMedia, type WebsiteProject } from '@/lib/website';
import WebsitePages from './WebsitePages';
import CampaignWebsite from './CampaignWebsite';
import EditorialWebsite from './EditorialWebsite';

const contentFields = [
  ['name', 'Portfolio name'], ['headline', 'Opening headline'],
  ['image', 'Cover image URL'], ['imageAlt', 'Cover image description'],
  ['email', 'Public enquiry email'], ['about', 'About'], ['services', 'Services'],
] as const;

export default function WebsiteBuilder({ initial, projects, media, publicId, isPublished }: {
  initial: Website; projects: WebsiteProject[]; media: WebsiteMedia[]; publicId?: string; isPublished: boolean;
}) {
  const [sampleImage, setSampleImage] = useState<string>(PRESETS.editorial.image);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [panel, setPanel] = useState<'design' | 'pages' | 'publish'>('design');
  useEffect(() => {
    const openLinkedPanel = () => {
      if (window.location.hash === '#page-editor') setPanel('pages');
    };
    openLinkedPanel();
    window.addEventListener('hashchange', openLinkedPanel);
    return () => window.removeEventListener('hashchange', openLinkedPanel);
  }, []);
  const [page, setPage] = useState('home');
  const [operation, setOperation] = useState<'draft' | 'publish' | 'unpublish'>('draft');
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
    setOperation(mode);
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

  const previewSite = normaliseWebsite(draft);
  const campaign = draft.theme.layout === 'campaign';
  return (
    <div className="website-builder">
      <section className="studio-panel website-controls">
        <div className="website-editor-tabs design-switch" aria-label="Editor section">
          {(['design', 'pages', 'publish'] as const).map(section =>
            <button key={section} type="button" aria-pressed={panel === section} onClick={() => {
              setPanel(section);
              if (section === 'design') setPage('home');
            }}>{section}</button>
          )}
        </div>
        <div hidden={panel !== 'design'} className="website-design-options">
        <h3>Start from a look</h3>
        <div className="template-options">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const theme = normaliseTheme(preset.theme);
            const active = ['layout', 'fonts', 'palette', 'header', 'hero'].every(field =>
              theme[field as keyof SiteTheme] === draft.theme[field as keyof SiteTheme]);
            return <button className="template-option" key={key} aria-pressed={active}
              style={{ ...themeVars(theme), background: 'var(--color-site)', color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' } as CSSProperties}
              onClick={() => { setSampleImage(preset.image); setDraft(current => ({ ...current, theme })); }}>
              {preset.label}
              {preset.image ? <img src={preset.image} alt="" /> : <div className="campaign-template-tile" aria-hidden="true" />}
              <small>{preset.description}</small>
            </button>;
          })}
        </div>
        {campaign && <p><Link href="/examples/campaign-stories" target="_blank" rel="noopener noreferrer">Explore the full-screen template ↗</Link></p>}
        <fieldset className="design-options"><legend>Typography</legend>
          <div className="template-options">{Object.entries(FONT_PAIRS).map(([key, font]) =>
            <button key={key} aria-pressed={draft.theme.fonts === key} onClick={() => updateTheme({ fonts: key as SiteTheme['fonts'] })}>
              <span style={{ fontFamily: font.display }}>{draft.name || 'Studio name'}</span><small>{font.label}</small>
            </button>
          )}</div>
        </fieldset>
        {!campaign && <>
        <fieldset className="design-options"><legend>Colours</legend>
          <div className="design-swatches">{Object.entries(PALETTES).map(([key, palette]) =>
            <button key={key} aria-pressed={draft.theme.palette === key} onClick={() => updateTheme({ palette: key as SiteTheme['palette'] })}>
              <span style={{ background: palette.site, color: palette.ink }}>A</span>{palette.label}
            </button>
          )}<button aria-pressed={draft.theme.palette === 'custom'} onClick={() => updateTheme({ palette: 'custom' })}>Your own</button></div>
        </fieldset>
        {draft.theme.palette === 'custom' && <div className="website-colours">
          <label>Background<input type="color" value={draft.theme.bg} onChange={e => updateTheme({ bg: e.target.value })} /></label>
          <label>Text<input type="color" value={draft.theme.ink} onChange={e => updateTheme({ ink: e.target.value })} /></label>
        </div>}
        <fieldset className="design-options"><legend>Header</legend>
          <div className="design-switch design-layout-choices">{HEADERS.map(header =>
            <button key={header} aria-pressed={draft.theme.header === header} onClick={() => updateTheme({ header })}>
              <span className={'design-layout-icon header-' + header} aria-hidden="true"><i /><i /></span>
              {header === 'left' ? 'Logo left' : header === 'centered' ? 'Centred' : 'Stacked'}
            </button>
          )}</div>
        </fieldset>
        <fieldset className="design-options"><legend>Top of the homepage</legend>
          <div className="design-switch design-layout-choices">{([['full', 'Full image'], ['split', 'Split'], ['framed', 'Framed'], ['text', 'Text only']] as const).map(([hero, label]) =>
            <button key={hero} aria-pressed={draft.theme.hero === hero} onClick={() => updateTheme({ hero })}><span className={'design-layout-icon hero-' + hero} aria-hidden="true"><i /><i /></span>{label}</button>
          )}</div>
        </fieldset>
        </>}
        <fieldset className="design-options"><legend>Social links</legend>
          <div className="design-switch">{(['footer', 'header', 'both'] as const).map(social =>
            <button key={social} aria-pressed={draft.theme.social === social} onClick={() => updateTheme({ social })}>{social}</button>
          )}</div>
          <label>Instagram profile URL<input type="url" value={draft.instagram} onChange={e => setDraft({ ...draft, instagram: e.target.value })} /></label>
        </fieldset>
        </div>
        <div hidden={panel !== 'pages'}>
        {campaign ? <WebsitePages draft={draft} setDraft={setDraft} projects={projects} media={media} page={page} onPage={setPage} /> :
          <div id="page-editor" className="website-pages"><h2>Pages &amp; media</h2><p>Select Campaign Stories below to place library images and arrange campaign pages.</p></div>}
        <details className="design-content">
        <summary>Portfolio content</summary>
        {contentFields.map(([key, label]) => (
          <label key={key}>
            {label}
            {key === 'about' || key === 'services'
              ? <textarea value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} rows={4} />
              : <input type={key === 'email' ? 'email' : key === 'image' ? 'url' : 'text'} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />}
          </label>
        ))}
        {campaign && <>
          <label>Showreel video URL<input type="url" placeholder="https://…/showreel.mp4" value={draft.video} onChange={e => setDraft({ ...draft, video: e.target.value })} /></label>

        </>}
        </details>
        </div>
        <div hidden={panel !== 'publish'}>
        <h2>Publishing</h2>
        <p>Add or import work from <Link href="/studio/projects">Projects</Link>. Only published projects appear on your site.</p>
        <label className="rights-check"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> I have permission to publish this content.</label>
        <button className="primary-button" disabled={pending || !confirmed} onClick={() => save('publish')}>{pending && operation === 'publish' ? 'Publishing…' : live ? 'Publish changes' : 'Publish website'}</button>
        {pending && operation === 'publish' && <progress className="website-publish-progress" aria-label="Publishing website" />}
        {live && id && <p><Link href={'/sites/' + id}>Open published website ↗</Link></p>}
        {live && <button className="secondary-button" disabled={pending} onClick={() => save('unpublish')}>Take website offline</button>}
        </div>
        <div className="website-save-strip">
          <button className="secondary-button" disabled={pending} onClick={() => save('draft')}>{pending && operation === 'draft' ? 'Saving…' : 'Save design'}</button>
          {panel !== 'publish' && <button className="primary-button" onClick={() => setPanel('publish')}>Publishing options</button>}
        </div>
        <p role="status">{pending ? operation === 'publish' ? 'Publishing your website…' : 'Saving…' : notice}</p>
      </section>
      <section id="website-preview" className="website-preview" aria-label="Website preview" tabIndex={-1}>
        <div className="design-preview-toolbar">
          <div className="design-switch" aria-label="Preview size">
            <button aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Desktop</button>
            <button aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Mobile</button>
          </div>
          {live && id && <Link href={'/sites/' + id}>Open website ↗</Link>}
        </div>
        {!campaign && !draft.image && draft.theme.hero !== 'text' && <p className="design-preview-note">Sample cover for preview. Set your cover in Portfolio content.</p>}
        <div className={'design-preview-frame ' + device}>
          {campaign ? <CampaignWebsite site={previewSite} projects={projects} preview
            view={projects.length || page === 'about' ? { about: page === 'about' ? '1' : undefined, campaign: page !== 'home' && page !== 'about' ? page : undefined } : undefined}
            onPreviewPage={next => { setPage(next); if (panel === 'design') setPanel('pages'); }} /> :
            <EditorialWebsite site={{ ...previewSite, image: previewSite.image || sampleImage }} projects={projects} preview />}
        </div>
      </section>
    </div>
  );
}
