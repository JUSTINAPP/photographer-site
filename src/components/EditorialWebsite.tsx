import Link from 'next/link';
import WebsiteSections from './WebsiteSections';
import WebsiteGallery from './WebsiteGallery';
import './campaign-website.css';
import PortfolioLogo from './PortfolioLogo';
import type { CSSProperties } from 'react';
import { themeVars } from '@/lib/website-theme';
import { websiteImage, type Website, type WebsiteProject } from '@/lib/website';

export default function EditorialWebsite({ site, projects, preview = false, base, onProject, allProjects = projects }: {
  site: Website; projects: WebsiteProject[]; preview?: boolean; base?: string; onProject?: (id: string) => void; allProjects?: WebsiteProject[];
}) {
  const social = site.instagram && (preview ? <span>Instagram</span> : <a href={site.instagram} rel="noreferrer">Instagram ↗</a>);
  const name = site.name || 'Your portfolio';
  return (
    <div className="editorial-site" style={themeVars(site.theme) as CSSProperties}>
      <header className={'editorial-header editorial-header-' + site.theme.header}>
        <strong><PortfolioLogo site={site} /></strong>
        <nav aria-label="Portfolio">
          {preview ? <><span>Work</span><span>About + Services</span><span>Contact</span></> : <><a href="#work">Work</a><a href="#about">About + Services</a><a href="#contact">Contact</a></>}
          {site.theme.social !== 'footer' && social}
        </nav>
      </header>
      <section className={'editorial-intro editorial-intro-' + site.theme.hero}>
        <h1>{site.headline || name}</h1>
        {site.image && site.theme.hero !== 'text' && <img src={site.image} alt={site.imageAlt} referrerPolicy="no-referrer" />}
      </section>
      <WebsiteSections sections={site.sections.home} projects={allProjects} base={base} onProject={onProject} />
      <WebsiteGallery images={site.homeGallery ?? []} label="Homepage photo gallery" projects={allProjects} base={base} onProject={onProject} />
      <section className={'editorial-work' + (site.homepageLayout === 'grid' ? ' editorial-work-grid' : '')} id={preview ? undefined : 'work'}>
        <h2>Selected work</h2>
        {projects.length === 0 && !site.homeGallery?.length && <p>{preview ? 'Publish a project to include it here.' : 'New work coming soon.'}</p>}
        {projects.map(project => (
          <article key={project.id}>
            {websiteImage(site.covers[project.id] || project.image_url || '') && <img src={site.covers[project.id] || project.image_url!} alt={project.title} loading="lazy" referrerPolicy="no-referrer" />}
            <p className="eyebrow">{project.category}</p>
            <h3>{onProject ? <button type="button" className="editorial-project-link" onClick={() => onProject(project.id)}>{project.title} ↗</button>
              : base ? <Link href={base + '?campaign=' + encodeURIComponent(project.id)}>{project.title} ↗</Link> : project.title}</h3>
            {project.description && <p>{project.description}</p>}
          </article>
        ))}
      </section>
      <section className="editorial-about" id={preview ? undefined : 'about'}>
        <h2>About + Services</h2><p>{site.about}</p><p>{site.services}</p>
      </section>
      <WebsiteSections sections={site.sections.about} projects={allProjects} base={base} onProject={onProject} />
      <footer className="editorial-about" id={preview ? undefined : 'contact'}>
        {site.logo && <PortfolioLogo site={site} />}
        <h2>Contact</h2>
        {site.theme.social !== 'header' && social}
        {site.email && (preview ? <p>{site.email}</p> : <a href={'mailto:' + site.email}>{site.email}</a>)}
      </footer>
    </div>
  );
}
