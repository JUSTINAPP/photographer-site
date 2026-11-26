'use client';
import SmartImage from '@/components/SmartImage';


import { ActionButton } from '@/components/ActionFeedback';

import Link from 'next/link';
import { useEffect, useState, useTransition, type CSSProperties } from 'react';
import { saveWebsite } from '@/app/studio/website/actions';
import { FONT_PAIRS, HEADERS, PALETTES, PRESETS, normaliseTheme, themeVars, type SiteTheme } from '@/lib/website-theme';
import { homepageWork, normaliseWebsite, type Website, type WebsiteMedia, type WebsiteProject } from '@/lib/website';
import DesignConversation from './DesignConversation';
import MotionEditor from './MotionEditor';
import LogoKitEditor from './LogoKitEditor';
import GalleryWebsite from './GalleryWebsite';
import {approveLogoKit} from '@/app/studio/settings/actions';
import type {DesignPatch} from '@/lib/design-agent';
import './portfolio-builder.css';
import WebsitePages from './WebsitePages';
import CampaignWebsite from './CampaignWebsite';
import EditorialWebsite from './EditorialWebsite';

const contentFields = [
  ['name', 'Portfolio name'],
  ['image', 'Cover image URL'], ['imageAlt', 'Cover image description'],
  ['email', 'Public enquiry email'],
] as const;

export default function WebsiteBuilder({ studioId, initial, projects, media, publicId, isPublished, readOnly = false, initialPanel = 'design', initialPage }: {
  studioId: string; initial: Website; projects: WebsiteProject[]; media: WebsiteMedia[]; publicId?: string; isPublished: boolean; readOnly?: boolean; initialPanel?: 'design' | 'pages'; initialPage?: string;
}) {
  const [sampleImage, setSampleImage] = useState<string>(PRESETS.editorial.image);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [panel, setPanel] = useState<'design' | 'pages' | 'publish' | 'brand' | 'motion'>(initialPanel);
  useEffect(() => {
    const openLinkedPanel = () => {
      if (window.location.hash === '#page-editor') setPanel('pages');
    };
    openLinkedPanel();
    window.addEventListener('hashchange', openLinkedPanel);
    return () => window.removeEventListener('hashchange', openLinkedPanel);
  }, []);
  const [page, setPage] = useState(initialPage === 'about' || projects.some(project => project.id === initialPage) ? initialPage! : 'home');
  const [editableProjects, setEditableProjects] = useState(projects);
  const [operation, setOperation] = useState<'draft' | 'publish' | 'unpublish'>('draft');
  const [draft, setDraft] = useState(initial);
  const [undo, setUndo] = useState<Website[]>([]);
  function applyDesign(changes: DesignPatch) {setUndo(h=>[...h.slice(-19),draft]);setDraft(current=>normaliseWebsite({...current,...changes}));setPage('home');}
  async function saveLook(name:string,references:string[]){
    const look={id:crypto.randomUUID(),name,theme:draft.theme,logoSize:draft.logoSize,homepageLayout:draft.homepageLayout,references};
    const next=normaliseWebsite({...draft,savedLooks:[...draft.savedLooks,look]});
    const result=await saveWebsite(studioId,next,'draft');if(result.error)throw Error(result.error);setDraft(next);setId(result.id);setNotice('Template and draft saved.');
  }
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
        const result = await saveWebsite(studioId, draft, mode);
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
  const work = homepageWork(previewSite, editableProjects);
  const editingProject = editableProjects.find(project => project.id === page);
  return (
    <div className="website-builder">
      {readOnly && <p className="studio-panel">You have view-only access to this portfolio. Use the preview to review the draft.</p>}
      {!readOnly &&
      <section className="studio-panel website-controls">
        <div className="website-editor-tabs design-switch" aria-label="Editor section">
          {(['design', 'brand', 'pages', 'motion', 'publish'] as const).map((section,index) =>
            <button key={section} type="button" aria-pressed={panel === section} onClick={() => {
              setPanel(section);
              if (section === 'design') setPage('home');
            }}><span>{index+1}</span> {({design:'Create',brand:'Logo',pages:'Pages',motion:'Opening',publish:'Publish'})[section]}</button>
          )}
        </div>
        <div hidden={panel !== 'design'} className="website-design-options">
        <DesignConversation draft={draft} onApply={applyDesign} canUndo={undo.length>0} onUndo={()=>{setDraft(undo[undo.length-1]);setUndo(h=>h.slice(0,-1));}} onSaveLook={saveLook}/>
        <details className="builder-manual" open={false}><summary>Choose a template or adjust the design yourself</summary>
        <h3>My saved templates</h3>
        {draft.savedLooks.length===0&&<p>Apply a design above, give it a name, then save it here.</p>}
        <div className="saved-look-options">{draft.savedLooks.map(look=><div key={look.id}><button type="button" onClick={()=>applyDesign({theme:look.theme,logoSize:look.logoSize,homepageLayout:look.homepageLayout})}><strong>{look.name}</strong><small>{look.theme.layout||'editorial'} · {look.theme.palette}</small></button><button type="button" aria-label={'Delete template '+look.name} onClick={()=>setDraft(d=>({...d,savedLooks:d.savedLooks.filter(l=>l.id!==look.id)}))}>×</button></div>)}</div>
        <h3>Ready-made starting points</h3>
        <div className="template-options">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const theme = normaliseTheme(preset.theme);
            const active = ['layout', 'fonts', 'palette', 'header', 'hero'].every(field =>
              theme[field as keyof SiteTheme] === draft.theme[field as keyof SiteTheme]);
            return <button className="template-option" key={key} aria-pressed={active}
              style={{ ...themeVars(theme), background: 'var(--color-site)', color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' } as CSSProperties}
              onClick={() => { setSampleImage(preset.image); setDraft(current => ({ ...current, theme })); }}>
              {preset.label}
              {preset.image ? <SmartImage variant="thumb" src={preset.image} alt="" /> : <div className="campaign-template-tile" aria-hidden="true" />}
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
        <fieldset className="design-options"><legend>Image layout</legend>
          <label>Grid columns · {draft.theme.columns}<input type="range" min="1" max="4" value={draft.theme.columns} onChange={e=>updateTheme({columns:Number(e.target.value)})}/></label>
          <label>Space between images · {draft.theme.gap}px<input type="range" min="0" max="80" value={draft.theme.gap} onChange={e=>updateTheme({gap:Number(e.target.value)})}/></label>
          <div className="design-switch">{(['cover','contain'] as const).map(heroFit=><button key={heroFit} aria-pressed={draft.theme.heroFit===heroFit} onClick={()=>updateTheme({heroFit})}>{heroFit==='cover'?'Fill the opening':'Show the whole photograph'}</button>)}</div>
          <label>Logo height · {draft.logoSize}px<input type="range" min="24" max="120" value={draft.logoSize} onChange={e=>setDraft(current=>({...current,logoSize:Number(e.target.value)}))}/></label>
        </fieldset>
        <fieldset className="design-options"><legend>Social links</legend>
          <div className="design-switch">{(['footer', 'header', 'both'] as const).map(social =>
            <button key={social} aria-pressed={draft.theme.social === social} onClick={() => updateTheme({ social })}>{social}</button>
          )}</div>
          <label>Instagram profile URL<input type="url" value={draft.instagram} onChange={e => setDraft({ ...draft, instagram: e.target.value })} /></label>
        </fieldset>
        </details>
        </div>
        <div hidden={panel !== 'brand'}><h2>Your identity, ready for every screen.</h2><LogoKitEditor logo={draft.logo} size={draft.logoSize} onApprove={async kit=>{const result=await approveLogoKit(studioId,kit);if(result.error)throw Error(result.error);setDraft(current=>({...current,...kit}));}}/></div>
        <div hidden={panel !== 'motion'}><MotionEditor studioId={studioId} motion={draft.motion} media={media} onChange={motion=>{setDraft(current=>({...current,motion}));setPage('home');}}/></div>
        <div hidden={panel !== 'pages'}>
        <WebsitePages studioId={studioId} draft={draft} setDraft={setDraft} projects={editableProjects} onProjects={setEditableProjects} media={media} page={page} onPage={setPage} />
        <details className="design-content">
        <summary>Portfolio content</summary>
        {contentFields.map(([key, label]) => (
          <label key={key}>
            {label}
            <input type={key === 'email' ? 'email' : key === 'image' ? 'url' : 'text'} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />
          </label>
        ))}
        {campaign && <>
          <label>Showreel video URL<input type="url" placeholder="https://…/showreel.mp4" value={draft.video} onChange={e => setDraft({ ...draft, video: e.target.value })} /></label>
          <p>Use a public link to the MP4 file. The homepage loops it silently and uses your cover photo while the clip loads.</p>

        </>}
        </details>
        </div>
        <div hidden={panel !== 'publish'}>
        <h2>Publishing</h2>
        <p>Review your desktop and mobile preview, then save or publish. AI edits stay in your draft until you publish.</p><ul className="builder-checklist"><li>{draft.name?'✓':'○'} Portfolio name</li><li>{draft.homeGallery?.length||work.length?'✓':'○'} Homepage photographs or projects</li><li>{draft.logo?'✓':'○'} Logo (optional)</li></ul>
        <p>Add or import work from <Link href="/studio/projects">Projects</Link>. Use Pages to choose and order the work visitors will see.</p>
        <label className="rights-check"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> I have permission to publish this content.</label>
        <ActionButton busy={pending && operation === 'publish'} className="primary-button" disabled={pending || !confirmed} onClick={() => save('publish')}>{pending && operation === 'publish' ? 'Publishing…' : live ? 'Publish changes' : 'Publish website'}</ActionButton>
        {pending && operation === 'publish' && <progress className="website-publish-progress" aria-label="Publishing website" />}
        {live && id && <p><Link href={'/sites/' + id}>Open published website ↗</Link></p>}
        {live && <ActionButton busy={pending && operation === 'unpublish'} className="secondary-button" disabled={pending} onClick={() => save('unpublish')}>Take website offline</ActionButton>}
        </div>
        <div className="website-save-strip">
          <ActionButton busy={pending && operation === 'draft'} className="secondary-button" disabled={pending} onClick={() => save('draft')}>{pending && operation === 'draft' ? 'Saving…' : 'Save draft'}</ActionButton>
          {panel !== 'publish' && <button className="primary-button" onClick={() => setPanel('publish')}>Publishing options</button>}
        </div>
        <p role="status">{pending ? operation === 'publish' ? 'Publishing your website…' : 'Saving…' : notice}</p>
      </section>}
      <section id="website-preview" className="website-preview" aria-label="Website preview" tabIndex={-1}>
        <div className="design-preview-toolbar">
          <div className="design-switch" aria-label="Preview size">
            <button aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Desktop</button>
            <button aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Mobile</button>
          </div>
          <Link href="/studio/website/preview" target="_blank" rel="noopener noreferrer">Open saved draft ↗</Link>
          {live && id && <Link href={'/sites/' + id}>Open website ↗</Link>}
        </div>
        {!campaign && draft.theme.layout !== 'gallery' && !draft.image && !draft.motion.enabled && draft.theme.hero !== 'text' && <p className="design-preview-note">Sample cover for preview. Set your cover in Portfolio content.</p>}
        <div className={'design-preview-frame ' + device}>
          {draft.theme.layout === 'gallery' ? <GalleryWebsite site={previewSite} projects={work} allProjects={editableProjects} preview view={{campaign:page!=='home'&&page!=='about'?page:undefined,about:page==='about'?'1':undefined}} onPreviewPage={next=>setPage(next)}/> : campaign || editingProject || page === 'about' ? <CampaignWebsite site={previewSite} projects={work} allProjects={editableProjects} preview previewProject={editingProject}
            view={editableProjects.length || page === 'about' ? { about: page === 'about' ? '1' : undefined, campaign: page !== 'home' && page !== 'about' ? page : undefined } : undefined}
            onPreviewPage={next => { setPage(next); if (panel === 'design') setPanel('pages'); }} /> :
            <EditorialWebsite site={{ ...previewSite, image: previewSite.image || sampleImage }} projects={work} allProjects={editableProjects} preview onProject={id => { setPage(id); setPanel('pages'); }} />}
        </div>
      </section>
    </div>
  );
}
