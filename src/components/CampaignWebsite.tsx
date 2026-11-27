'use client';
import WebsiteFilms from './WebsiteFilms';
import InlineWebsiteText from './InlineWebsiteText';
import {EditableRegion,HomeProjectTools,useWebsiteEditing} from './WebsiteEditing';
import WebsiteNavigation from './WebsiteNavigation';
import WebsiteAboutContent, { type AboutTextChange } from './WebsiteAboutContent';
import {headerPresentation} from '@/lib/website-header';
import HomepageMotion from './HomepageMotion';
import './portfolio-builder.css';
import WebsiteIdentity from './WebsiteIdentity';
import MobilePortfolioMenu from './MobilePortfolioMenu';

import { imageDisplayUrl } from '@/lib/image-display';

import SmartImage from '@/components/SmartImage';


import Link from 'next/link';
import WebsiteSections from './WebsiteSections';
import WebsiteGallery from './WebsiteGallery';
import PortfolioLogo from './PortfolioLogo';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { orderWebsiteProjects, websiteGallery, type GalleryImage, type Website, type WebsiteProject } from '@/lib/website';
import { collectionAnchor, portfolioCollections } from '@/lib/portfolio-collections';
import { FONT_PAIRS, themeVars } from '@/lib/website-theme';
import './campaign-website.css';

const campaignSamples: WebsiteProject[] = [
  { id: 'still-in-motion', title: 'Still in Motion', category: 'Fashion · Editorial', description: 'A study in movement, shape and shadow. The series moves between close detail and wide, quiet frames.', image_url: null },
  { id: 'waterline', title: 'Waterline', category: 'Nautical · Campaign', description: 'A story told from the deck, with open water, shifting light and the details of life under sail.', image_url: null },
  { id: 'long-afternoon', title: 'The Long Afternoon', category: 'Lifestyle · Campaign', description: 'An unhurried afternoon in natural light, told through gestures, textures and the spaces between them.', image_url: null },
];

type View = { about?: string; campaign?: string };

function Media({ url, label, eager = false }: { url?: string | null; label: string; eager?: boolean }) {
  return url
    ? <SmartImage className="campaign-media" src={url} alt={label} priority={eager} variant={eager ? 'hero' : 'card'} loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
    : <div className="campaign-media campaign-placeholder"><span>{label}</span></div>;
}

export default function CampaignWebsite({ site, projects, base, view, preview = false, sample = false, onPreviewPage, previewProject, allProjects, onAboutChange, onSectionChange }: {
  onAboutChange?: AboutTextChange; onSectionChange?: (page: string, id: string, field: 'heading' | 'text', value: string) => void;
  site: Website; projects: WebsiteProject[]; base?: string; view?: View; preview?: boolean; sample?: boolean; onPreviewPage?: (page: string) => void; previewProject?: WebsiteProject; allProjects?: WebsiteProject[];
}) {
  const edit=useWebsiteEditing();
  const text=(field:'heroLabel'|'openingTitle'|'openingScrollLabel'|'headline'|'introLabel'|'introText'|'contactLabel'|'contactTitle')=>edit?(value:string)=>edit.update({[field]:value}):undefined;
  const [localView, setLocalView] = useState<View>({});
  const [scrolled, setScrolled] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const current = view ?? localView;
  const work = sample || (preview && !projects.length && site.homepageProjects === null && !previewProject) ? campaignSamples : orderWebsiteProjects(projects, site.projectOrder);
  const groups = portfolioCollections.map(({ name }) => ({
    name, projects: work.filter(project => site.collections[project.id] === name),
  })).filter(group => group.projects.length);
  const ungrouped = work.filter(project => !site.collections[project.id]);
  const targets = (allProjects?.length ? allProjects : work).filter(project=>!site.removedPages.includes(project.id));
  const selectedSource = targets.find(project => project.id === current.campaign) ?? (previewProject?.id === current.campaign ? previewProject : undefined);
  const selected=selectedSource&&!site.removedPages.includes(selectedSource.id)?{...selectedSource,...site.pageCopy[selectedSource.id]}:undefined;
  const illustrative = sample || (preview && !projects.length && site.homepageProjects === null && !previewProject);
  const headerLook = headerPresentation(site.theme,scrolled||!!current.about,true);
  const name = site.name || 'Your studio';
  const social = site.instagram && <a href={site.instagram} rel="noreferrer">Instagram ↗</a>;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPlayVideo(!motion.matches);
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const frame = preview ? root.current?.closest('.design-preview-frame') : null;
    if (frame && view) frame.scrollTo(0, 0);
    const scroller = frame ?? window;
    const update = () => setScrolled((frame ? frame.scrollTop : window.scrollY) > 30);
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    return () => scroller.removeEventListener('scroll', update);
  }, [preview, current.about, current.campaign]);

  useEffect(() => {
    if (!preview && !window.location.hash) window.scrollTo(0, 0);
  }, [preview, current.about, current.campaign]);

  async function toggleVideo() {
    if (!video.current) return;
    if (video.current.paused) {
      try { await video.current.play(); } catch { return; }
    } else {
      video.current.pause();
    }
  }

  function go(next: View, anchor?: string) {
    setLocalView(next);
    if (onPreviewPage && (!next.campaign || targets.some(project => project.id === next.campaign))) {
      onPreviewPage(next.about ? 'about' : next.campaign || 'home');
    }
    requestAnimationFrame(() => {
      const frame = root.current?.closest('.design-preview-frame');
      if (anchor) root.current?.querySelector('[data-anchor="' + anchor + '"]')?.scrollIntoView({ block: 'start' });
      else frame?.scrollTo(0, 0);
    });
  }

  function navigation(next: View, children: ReactNode, className?: string, anchor?: string) {
    if (preview) return <button type="button" className={className} onClick={() => go(next, anchor)}>{children}</button>;
    const query = new URLSearchParams();
    if (next.about) query.set('about', '1');
    if (next.campaign) query.set('campaign', next.campaign);
    return <Link className={className} href={base + (query.size ? '?' + query.toString() : '') + (anchor ? '#' + anchor : '')}>{children}</Link>;
  }

  const images = selected ? websiteGallery(site, selected.id) : [];
  const gallery: GalleryImage[] = images.length || !illustrative ? images : ['wide', 'grid', 'grid', 'wide'].map(size => ({ url: '', alt: '', size: size as GalleryImage['size'] }));
  const related = selected ? (site.related[selected.id] ?? work.filter(project => project.id !== selected.id).map(project => project.id))
    .flatMap(id => targets.filter(project => project.id === id && project.id !== selected.id)) : [];
  const openProject = preview ? (id: string) => go(id==='home'?{}:id==='about'?{about:'1'}:{ campaign: id }) : undefined;
  const colours = FONT_PAIRS[site.theme.fonts];

  const tiles = (items: WebsiteProject[], grid: boolean) => <div className={grid ? 'campaign-home-grid' : undefined}>
    {items.map(project => <div key={project.id} style={{position:'relative'}}><HomeProjectTools id={project.id} ids={work.map(item=>item.id)}/>
      {navigation({ campaign: project.id }, <>
        <Media url={site.covers[project.id] || project.image_url} label="Campaign cover" />
        <div className="campaign-caption"><p>{site.collections[project.id] || project.category}</p><h2>{project.title}</h2><span>View campaign ↗</span></div>
      </>, 'campaign-screen campaign-feature')}
    </div>)}
  </div>;

  return <div className={'campaign-site' + (preview ? ' campaign-preview' : '')+(site.navigation.length>6?' has-long-menu':'')} ref={root}
    style={{ ...themeVars(site.theme), '--campaign-font': colours.text, '--campaign-display': colours.display } as CSSProperties}>
    <WebsiteIdentity site={site} preview={preview}/>
    <div className="campaign-header-anchor"><header style={{color:headerLook.color,background:headerLook.background,borderBottom:headerLook.borderBottom}} className={'campaign-header' + (scrolled || current.about ? ' is-solid' : '')}>
      {navigation({}, <PortfolioLogo site={site} light={headerLook.lightLogo} />, 'campaign-wordmark')}
      <nav aria-label="Portfolio">{site.navigation.length?<WebsiteNavigation site={site} base={base} onPage={preview?id=>go(id==='home'?{}:id==='about'||id==='contact'?{about:'1'}:{campaign:id},id==='contact'?'contact':undefined):undefined}/>:<>{groups.length ? groups.map(group => <span key={group.name}>{navigation({}, group.name, undefined, collectionAnchor(group.name))}</span>) : navigation({}, 'Work', undefined, 'work')}{navigation({about:'1'},'About + Services')}{navigation({about:'1'},'Contact',undefined,'contact')}{social}</>}</nav>
      <MobilePortfolioMenu>{site.navigation.length?<WebsiteNavigation site={site} base={base} onPage={preview?id=>go(id==='home'?{}:id==='about'||id==='contact'?{about:'1'}:{campaign:id},id==='contact'?'contact':undefined):undefined}/>:<>{navigation({},'Work',undefined,'work')}{navigation({about:'1'},'About + Services')}{navigation({about:'1'},'Contact',undefined,'contact')}{social}</>}</MobilePortfolioMenu>
    </header></div>

    {current.about ? <>
      <WebsiteAboutContent site={site} illustrative={illustrative} onChange={onAboutChange} />
      <WebsiteSections site={site} onTextChange={onSectionChange ? (id, field, text) => onSectionChange('about', id, field, text) : undefined} sections={site.sections.about} projects={targets} base={base} onProject={openProject} />
      <WebsiteGallery site={site} pageId="about" images={websiteGallery(site,'about')} label="About photo gallery" projects={targets} base={base} onProject={openProject}/>
    </> : selected ? <>
      <EditableRegion site={site} id={selected.id+':opening'}><section className="campaign-screen">
        {site.pageMotion[selected.id]?.enabled&&site.pageMotion[selected.id].clips.length?<HomepageMotion motion={site.pageMotion[selected.id]} preview={preview}/>:<Media url={site.covers[selected.id] || selected.image_url} label="Campaign cover image" eager />}
        <div className="campaign-caption"><InlineWebsiteText value={selected.category} label="Page cover label" maxLength={80} onChange={edit?value=>edit.project(selected.id,{category:value}):undefined}/><InlineWebsiteText as="h1" value={selected.title} label="Page cover title" maxLength={180} onChange={edit?value=>edit.project(selected.id,{title:value}):undefined}/></div>
      </section></EditableRegion>
      <EditableRegion site={site} id={selected.id+':copy'}><section className="campaign-copy"><InlineWebsiteText className="campaign-kicker" value={selected.category} label="Page label" maxLength={80} onChange={edit?value=>edit.project(selected.id,{category:value}):undefined}/><InlineWebsiteText as="h2" value={selected.title} label="Page heading" maxLength={180} onChange={edit?value=>edit.project(selected.id,{title:value}):undefined}/><InlineWebsiteText value={selected.description||''} label="Page description" multiline maxLength={2000} onChange={edit?value=>edit.project(selected.id,{description:value}):undefined}/></section></EditableRegion>
      <WebsiteFilms site={site} page={selected.id}/>
      <WebsiteSections site={site} onTextChange={onSectionChange ? (id, field, text) => onSectionChange(selected.id, id, field, text) : undefined} sections={site.sections[selected.id]} projects={targets} base={base} onProject={openProject} />
      {illustrative && gallery.length > 0 && <section className="campaign-gallery" aria-label="Campaign gallery">
        {gallery.map(({ url, size, alt }, i) => <div key={i} className={'campaign-frame-' + size}><Media url={url} label={alt || (size === 'grid' ? 'Campaign grid image' : 'Full-size campaign image')} /></div>)}
      </section>}
      {!illustrative && <WebsiteGallery site={site} pageId={selected.id} images={gallery} label="Campaign gallery" projects={targets} base={base} onProject={openProject} />}
      {related.length > 0 && <section className="campaign-more campaign-copy"><h2>More work</h2><div className="campaign-squares">
        {related.map(project => <div key={project.id}>
          {navigation({ campaign: project.id }, <><Media url={site.covers[project.id] || project.image_url} label="Campaign image" /><strong>{project.title}</strong></>, 'campaign-square')}
        </div>)}
      </div></section>}
    </> : <>
      <EditableRegion site={site} id="home:opening"><section className="campaign-screen">
        {site.motion.enabled && site.motion.clips.length ? <HomepageMotion motion={site.motion} poster={site.image} preview={preview}/> : site.video && playVideo
          ? <video ref={video} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} className="campaign-media" src={site.video} poster={site.image ? imageDisplayUrl(site.image,1280) : undefined} preload="metadata" muted autoPlay loop playsInline aria-label="Studio showreel" />
          : <Media url={site.image} label="Full-screen showreel" eager />}
        {(site.showOpeningText||edit||(site.video&&playVideo))&&<div className="campaign-caption">{edit&&<button type="button" className="opening-text-toggle" onClick={()=>edit.update({showOpeningText:!site.showOpeningText})}>{site.showOpeningText?'Hide opening text':'Show opening text'}</button>}{site.showOpeningText&&<><InlineWebsiteText value={site.heroLabel} label="Homepage opening label" maxLength={100} onChange={text('heroLabel')}/><InlineWebsiteText as="h1" value={site.openingTitle??(site.headline||name)} label="Homepage opening title" maxLength={220} onChange={text('openingTitle')}/>
          {edit?<InlineWebsiteText value={site.openingScrollLabel} label="Homepage scroll hint" maxLength={100} onChange={text('openingScrollLabel')}/>:site.openingScrollLabel?navigation({},site.openingScrollLabel,undefined,'work'):null}</>}
          {site.video && playVideo && <button className="campaign-video-toggle" type="button" onClick={toggleVideo}>{paused ? 'Play film' : 'Pause film'}</button>}
        </div>}
      </section></EditableRegion>
      {site.showIntro ? <EditableRegion site={site} id="home:introduction"><section className="campaign-copy" id={preview ? undefined : 'work'} data-anchor="work">
        <InlineWebsiteText className="campaign-kicker" value={site.introLabel} label="Homepage introduction label" maxLength={100} onChange={text('introLabel')}/><InlineWebsiteText as="h2" value={site.introText} label="Homepage introduction text" multiline onChange={text('introText')} placeholder="Click to add a short introduction"/>
        {navigation({ about: '1' }, 'About the studio ↗', 'campaign-text-link')}
      </section></EditableRegion> : <div id={preview ? undefined : 'work'} data-anchor="work" />}
      <WebsiteSections site={site} onTextChange={onSectionChange ? (id, field, text) => onSectionChange('home', id, field, text) : undefined} sections={site.sections.home} projects={targets} base={base} onProject={openProject} />
      <WebsiteGallery site={site} images={site.homeGallery ?? []} label="Homepage photo gallery" projects={targets} base={base} onProject={openProject} />
      {groups.map(group => <section className="campaign-collection" key={group.name}
        id={preview ? undefined : collectionAnchor(group.name)} data-anchor={collectionAnchor(group.name)}>
        <h2>{group.name}</h2>
        {tiles(group.projects, true)}
      </section>)}
      {tiles(ungrouped, site.homepageLayout === 'grid')}
    </>}

    <EditableRegion site={site} id="contact:footer"><footer className="campaign-copy campaign-footer" id={preview ? undefined : 'contact'} data-anchor="contact">
      <div>{site.logo && <PortfolioLogo site={site} light={headerLook.lightLogo} />}<InlineWebsiteText className="campaign-kicker" value={site.contactLabel} label="Contact label" maxLength={100} onChange={text('contactLabel')}/><InlineWebsiteText as="h2" value={site.contactTitle} label="Contact heading" maxLength={220} onChange={text('contactTitle')}/>
        {site.email && <a href={'mailto:' + site.email}>{site.email}</a>}
      </div>
      {site.theme.social !== 'header' && social}
      {navigation({}, 'Back to work ↑', 'campaign-text-link')}
    </footer></EditableRegion>
  </div>;
}
