'use client';
import InlineWebsiteText from './InlineWebsiteText';
import SmartImage from '@/components/SmartImage';
import Link from 'next/link';
import { campaignHref, type WebsiteSection } from '@/lib/website-sections';
import type { WebsiteProject } from '@/lib/website';

export default function WebsiteSections({ sections, projects, base, onProject, onTextChange }: {
  onTextChange?: (id: string, field: 'heading' | 'text', value: string) => void;
  sections?: WebsiteSection[]; projects: WebsiteProject[]; base?: string; onProject?: (id: string) => void;
}) {
  return sections?.map(section => {
    const target = projects.find(project => project.id === section.link);
    if (!section.image && !section.heading && !section.text && !target && !onTextChange) return null;
    const link = (content: React.ReactNode, label?: string) => target && (onProject || base)
      ? onProject ? <button type="button" className="website-section-link" aria-label={label} onClick={() => onProject(target.id)}>{content}</button>
        : <Link className="website-section-link" href={campaignHref(base!, target.id)} aria-label={label}>{content}</Link>
      : content;
    const image = section.image && section.layout !== 'text'
      ? <SmartImage src={section.image} alt={section.alt} loading="lazy" referrerPolicy="no-referrer" /> : null;
    return <section key={section.id} className={'portfolio-section portfolio-section-' + section.layout}>
      {image && <div className="portfolio-section-image">{link(image, target ? 'View ' + target.title : undefined)}</div>}
      {(section.heading || section.text || target || onTextChange) && <div className="portfolio-section-copy">
        {(section.heading || onTextChange) && <InlineWebsiteText as="h2" value={section.heading} label="Section heading" maxLength={140} onChange={onTextChange ? text => onTextChange(section.id, 'heading', text) : undefined} placeholder="Click to add a heading" />}
        {(section.text || onTextChange) && <InlineWebsiteText value={section.text} label="Section text" multiline maxLength={1800} onChange={onTextChange ? text => onTextChange(section.id, 'text', text) : undefined} placeholder="Click to add text" />}
        {target && link(<span>{target.title} ↗</span>)}
      </div>}
    </section>;
  });
}
