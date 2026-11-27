'use client';
import InlineWebsiteText from './InlineWebsiteText';
import {EditableRegion,HomeProjectTools,useWebsiteEditing} from './WebsiteEditing';
import WebsiteNavigation from './WebsiteNavigation';
import WebsiteAboutContent, { type AboutTextChange } from './WebsiteAboutContent';
import HomepageMotion from './HomepageMotion';
import './portfolio-builder.css';

import {usePortfolioHeader} from './usePortfolioHeader';
import WebsiteIdentity from './WebsiteIdentity';
import MobilePortfolioMenu from './MobilePortfolioMenu';
import SmartImage from '@/components/SmartImage';
import Link from 'next/link';
import WebsiteSections from './WebsiteSections';
import WebsiteGallery from './WebsiteGallery';
import './campaign-website.css';
import PortfolioLogo from './PortfolioLogo';
import type { CSSProperties } from 'react';
import { themeVars } from '@/lib/website-theme';
import { websiteImage, type Website, type WebsiteProject } from '@/lib/website';

export default function EditorialWebsite({ site, projects, preview = false, base, onProject, allProjects = projects, onSectionChange, onAboutChange }: {
  onAboutChange?: AboutTextChange;
  onSectionChange?: (page: string, id: string, field: 'heading' | 'text', value: string) => void;
  site: Website; projects: WebsiteProject[]; preview?: boolean; base?: string; onProject?: (id: string) => void; allProjects?: WebsiteProject[];
}) {
  allProjects=allProjects.filter(project=>!site.removedPages.includes(project.id));
  const edit=useWebsiteEditing();
  const {root,look:headerLook}=usePortfolioHeader(site.theme,preview);
  const social = site.instagram && (preview ? <span>Instagram</span> : <a href={site.instagram} rel="noreferrer">Instagram ↗</a>);
  const name = site.name || 'Your portfolio';
  return (
    <div ref={root} className={'editorial-site'+(site.navigation.length>6?' has-long-menu':'')} style={themeVars(site.theme) as CSSProperties}>
      <WebsiteIdentity site={site} preview={preview}/><header style={{color:headerLook.color,background:headerLook.background,borderBottom:headerLook.borderBottom}} className={'editorial-header editorial-header-' + site.theme.header}>
        <strong><PortfolioLogo site={site} light={headerLook.lightLogo} /></strong>
        <nav aria-label="Portfolio">
          {site.navigation.length?<WebsiteNavigation site={site} base={base} onPage={preview?onProject:undefined}/>:preview ? <><button onClick={()=>onProject?.('home')}>Work</button><a href="#about">About + Services</a><a href="#contact">Contact</a></> : <><a href="#work">Work</a><a href="#about">About + Services</a><a href="#contact">Contact</a></>}
          {!site.navigation.length && site.theme.social !== 'footer' && social}
        </nav><MobilePortfolioMenu>
          {site.navigation.length?<WebsiteNavigation site={site} base={base} onPage={preview?onProject:undefined}/>:preview ? <><button onClick={()=>onProject?.('home')}>Work</button><a href="#about">About + Services</a><a href="#contact">Contact</a></> : <><a href="#work">Work</a><a href="#about">About + Services</a><a href="#contact">Contact</a></>}
          {!site.navigation.length && site.theme.social !== 'footer' && social}
        </MobilePortfolioMenu>
      </header>
      <EditableRegion site={site} id="home:opening">{site.motion.enabled && site.motion.clips.length ? <HomepageMotion motion={site.motion} poster={site.image} preview={preview}/> : site.video?<div className="homepage-motion"><video src={site.video} poster={site.image} muted autoPlay loop playsInline preload="metadata" aria-label="Homepage showreel"/></div>: <section className={'editorial-intro editorial-intro-' + site.theme.hero}>
        <InlineWebsiteText as="h1" value={site.showOpeningText?(site.openingTitle??(site.headline||name)):''} label="Homepage opening title" onChange={edit?value=>edit.update({openingTitle:value,showOpeningText:true}):undefined}/>
        {site.image && site.theme.hero !== 'text' && <SmartImage variant="hero" priority src={site.image} alt={site.imageAlt} referrerPolicy="no-referrer" />}
      </section>}</EditableRegion>
      <WebsiteSections site={site} onTextChange={onSectionChange ? (id, field, text) => onSectionChange('home', id, field, text) : undefined} sections={site.sections.home} projects={allProjects} base={base} onProject={onProject} />
      <WebsiteGallery site={site} images={site.homeGallery ?? []} label="Homepage photo gallery" projects={allProjects} base={base} onProject={onProject} />
      <section className={'editorial-work' + (site.homepageLayout === 'grid' ? ' editorial-work-grid' : '')} id={preview ? undefined : 'work'}>
        <h2>Selected work</h2>
        {projects.length === 0 && !site.homeGallery?.length && <p>{preview ? 'Publish a project to include it here.' : 'New work coming soon.'}</p>}
        {projects.map(project => (
          <article key={project.id} style={{position:'relative'}}><HomeProjectTools id={project.id} ids={projects.map(item=>item.id)}/>
            {websiteImage(site.covers[project.id] || project.image_url || '') && <SmartImage src={site.covers[project.id] || project.image_url!} alt={project.title} loading="lazy" referrerPolicy="no-referrer" />}
            <p className="eyebrow">{project.category}</p>
            <h3>{onProject ? <button type="button" className="editorial-project-link" onClick={() => onProject(project.id)}>{project.title} ↗</button>
              : base ? <Link href={base + '?campaign=' + encodeURIComponent(project.id)}>{project.title} ↗</Link> : project.title}</h3>
            {project.description && <p>{project.description}</p>}
          </article>
        ))}
      </section>
      <div id={preview ? undefined : 'about'}><WebsiteAboutContent site={site} onChange={onAboutChange}/></div>
      <WebsiteSections site={site} onTextChange={onSectionChange ? (id, field, text) => onSectionChange('about', id, field, text) : undefined} sections={site.sections.about} projects={allProjects} base={base} onProject={onProject} />
      <EditableRegion site={site} id="contact:footer"><footer className="editorial-about" id={preview ? undefined : 'contact'}>
        {site.logo && <PortfolioLogo site={site} />}
        <InlineWebsiteText as="h2" value={site.contactTitle} label="Contact heading" maxLength={220} onChange={edit?value=>edit.update({contactTitle:value}):undefined}/>
        {site.theme.social !== 'header' && social}
        {site.email && (preview ? <p>{site.email}</p> : <a href={'mailto:' + site.email}>{site.email}</a>)}
      </footer></EditableRegion>
    </div>
  );
}
