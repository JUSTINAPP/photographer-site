'use client';

import Link from 'next/link';
import WebsiteSections from './WebsiteSections';
import WebsiteGallery from './WebsiteGallery';
import PortfolioLogo from './PortfolioLogo';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { orderWebsiteProjects, websiteGallery, type GalleryImage, type Website, type WebsiteProject } from '@/lib/website';
import { collectionAnchor, portfolioCollections } from '@/lib/portfolio-collections';
import { FONT_PAIRS } from '@/lib/website-theme';
import './campaign-website.css';

const campaignSamples: WebsiteProject[] = [
  { id: 'still-in-motion', title: 'Still in Motion', category: 'Fashion · Editorial', description: 'A study in movement, shape and shadow. The series moves between close detail and wide, quiet frames.', image_url: null },
  { id: 'waterline', title: 'Waterline', category: 'Nautical · Campaign', description: 'A story told from the deck, with open water, shifting light and the details of life under sail.', image_url: null },
  { id: 'long-afternoon', title: 'The Long Afternoon', category: 'Lifestyle · Campaign', description: 'An unhurried afternoon in natural light, told through gestures, textures and the spaces between them.', image_url: null },
];

type View = { about?: string; campaign?: string };

function Media({ url, label, eager = false }: { url?: string | null; label: string; eager?: boolean }) {
  return url
    ? <img className="campaign-media" src={url} alt={label} loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
    : <div className="campaign-media campaign-placeholder"><span>{label}</span></div>;
}

export default function CampaignWebsite({ site, projects, base, view, preview = false, sample = false, onPreviewPage, previewProject, allProjects }: {
  site: Website; projects: WebsiteProject[]; base?: string; view?: View; preview?: boolean; sample?: boolean; onPreviewPage?: (page: string) => void; previewProject?: WebsiteProject; allProjects?: WebsiteProject[];
}) {
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
  const targets = allProjects?.length ? allProjects : work;
  const selected = targets.find(project => project.id === current.campaign) ?? (previewProject?.id === current.campaign ? previewProject : undefined);
  const illustrative = sample || (preview && !projects.length && site.homepageProjects === null && !previewProject);
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
  const openProject = preview ? (id: string) => go({ campaign: id }) : undefined;
  const colours = FONT_PAIRS[site.theme.fonts];

  const tiles = (items: WebsiteProject[], grid: boolean) => <div className={grid ? 'campaign-home-grid' : undefined}>
    {items.map(project => <div key={project.id}>
      {navigation({ campaign: project.id }, <>
        <Media url={site.covers[project.id] || project.image_url} label="Campaign cover" />
        <div className="campaign-caption"><p>{site.collections[project.id] || project.category}</p><h2>{project.title}</h2><span>View campaign ↗</span></div>
      </>, 'campaign-screen campaign-feature')}
    </div>)}
  </div>;

  return <div className={'campaign-site' + (preview ? ' campaign-preview' : '')} ref={root}
    style={{ '--campaign-font': colours.text, '--campaign-display': colours.display } as CSSProperties}>
    <header className={'campaign-header' + (scrolled || current.about ? ' is-solid' : '')}>
      {navigation({}, <PortfolioLogo site={site} />, 'campaign-wordmark')}
      <nav aria-label="Portfolio">
        {groups.length ? groups.map(group => <span key={group.name}>{navigation({}, group.name, undefined, collectionAnchor(group.name))}</span>) : navigation({}, 'Work', undefined, 'work')}
        {navigation({ about: '1' }, 'About + Services')}
        {navigation({ about: '1' }, 'Contact', undefined, 'contact')}
        {(groups.length > 0 || site.theme.social !== 'footer') && social}
      </nav>
    </header>

    {current.about ? <>
      <section className="campaign-about campaign-copy">
        <div><p className="campaign-kicker">About the studio</p><h1>{name}</h1>
          <p>{site.about || (illustrative ? 'An independent photography and film practice working across fashion, coastal life and commercial campaigns.' : '')}</p></div>
        {(site.clients || illustrative) && <aside><h2>Selected clients</h2>
          <ul>{(site.clients || 'Client name 01\nClient name 02\nClient name 03').split('\n').map((client, i) => client.trim() && <li key={i}>{client.trim()}</li>)}</ul>
        </aside>}
      </section>
      <section className="campaign-services campaign-copy"><p className="campaign-kicker">Capabilities</p><h2>Services</h2>
        <p>{site.services || (illustrative ? 'Campaign photography\nEditorial photography\nMotion and short-form film\nCreative direction' : '')}</p>
      </section>
      <WebsiteSections sections={site.sections.about} projects={targets} base={base} onProject={openProject} />
    </> : selected ? <>
      <section className="campaign-screen">
        <Media url={site.covers[selected.id] || selected.image_url} label="Campaign cover image" eager />
        <div className="campaign-caption"><p>{selected.category}</p><h1>{selected.title}</h1></div>
      </section>
      <section className="campaign-copy"><p className="campaign-kicker">{selected.category}</p><h2>{selected.title}</h2><p>{selected.description}</p></section>
      {site.films[selected.id] && <div className="campaign-film">
        <iframe src={site.films[selected.id]} title={selected.title} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen />
      </div>}
      <WebsiteSections sections={site.sections[selected.id]} projects={targets} base={base} onProject={openProject} />
      {illustrative && gallery.length > 0 && <section className="campaign-gallery" aria-label="Campaign gallery">
        {gallery.map(({ url, size, alt }, i) => <div key={i} className={'campaign-frame-' + size}><Media url={url} label={alt || (size === 'grid' ? 'Campaign grid image' : 'Full-size campaign image')} /></div>)}
      </section>}
      {!illustrative && <WebsiteGallery images={gallery} label="Campaign gallery" projects={targets} base={base} onProject={openProject} />}
      {related.length > 0 && <section className="campaign-more campaign-copy"><h2>More work</h2><div className="campaign-squares">
        {related.map(project => <div key={project.id}>
          {navigation({ campaign: project.id }, <><Media url={site.covers[project.id] || project.image_url} label="Campaign image" /><strong>{project.title}</strong></>, 'campaign-square')}
        </div>)}
      </div></section>}
    </> : <>
      <section className="campaign-screen">
        {site.video && playVideo
          ? <video ref={video} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} className="campaign-media" src={site.video} poster={site.image || undefined} muted autoPlay loop playsInline aria-label="Studio showreel" />
          : <Media url={site.image} label="Full-screen showreel" eager />}
        <div className="campaign-caption"><p>Photography &amp; film</p><h1>{site.headline || name}</h1>
          {navigation({}, 'Scroll to explore ↓', undefined, 'work')}
          {site.video && playVideo && <button className="campaign-video-toggle" type="button" onClick={toggleVideo}>{paused ? 'Play film' : 'Pause film'}</button>}
        </div>
      </section>
      {site.showIntro ? <section className="campaign-copy" id={preview ? undefined : 'work'} data-anchor="work">
        <p className="campaign-kicker">Selected work</p><h2>{site.about || (illustrative ? 'Photographs and films for stories worth spending time with.' : name)}</h2>
        {navigation({ about: '1' }, 'About the studio ↗', 'campaign-text-link')}
      </section> : <div id={preview ? undefined : 'work'} data-anchor="work" />}
      <WebsiteSections sections={site.sections.home} projects={targets} base={base} onProject={openProject} />
      <WebsiteGallery images={site.homeGallery ?? []} label="Homepage photo gallery" projects={targets} base={base} onProject={openProject} />
      {groups.map(group => <section className="campaign-collection" key={group.name}
        id={preview ? undefined : collectionAnchor(group.name)} data-anchor={collectionAnchor(group.name)}>
        <h2>{group.name}</h2>
        {tiles(group.projects, true)}
      </section>)}
      {tiles(ungrouped, site.homepageLayout === 'grid')}
    </>}

    <footer className="campaign-copy campaign-footer" id={preview ? undefined : 'contact'} data-anchor="contact">
      <div>{site.logo && <PortfolioLogo site={site} />}<p className="campaign-kicker">Contact</p><h2>Let’s make something.</h2>
        {site.email && <a href={'mailto:' + site.email}>{site.email}</a>}
      </div>
      {site.theme.social !== 'header' && social}
      {navigation({}, 'Back to work ↑', 'campaign-text-link')}
    </footer>
  </div>;
}
