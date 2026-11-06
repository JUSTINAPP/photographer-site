import Link from 'next/link';
import { campaignHref, type WebsiteSection } from '@/lib/website-sections';
import type { WebsiteProject } from '@/lib/website';

export default function WebsiteSections({ sections, projects, base, onProject }: {
  sections?: WebsiteSection[]; projects: WebsiteProject[]; base?: string; onProject?: (id: string) => void;
}) {
  return sections?.map(section => {
    const target = projects.find(project => project.id === section.link);
    if (!section.image && !section.heading && !section.text && !target) return null;
    const link = (content: React.ReactNode, label?: string) => target && (onProject || base)
      ? onProject ? <button type="button" className="website-section-link" aria-label={label} onClick={() => onProject(target.id)}>{content}</button>
        : <Link className="website-section-link" href={campaignHref(base!, target.id)} aria-label={label}>{content}</Link>
      : content;
    const image = section.image && section.layout !== 'text'
      ? <img src={section.image} alt={section.alt} loading="lazy" referrerPolicy="no-referrer" /> : null;
    return <section key={section.id} className={'portfolio-section portfolio-section-' + section.layout}>
      {image && <div className="portfolio-section-image">{link(image, target ? 'View ' + target.title : undefined)}</div>}
      {(section.heading || section.text || target) && <div className="portfolio-section-copy">
        {section.heading && <h2>{section.heading}</h2>}
        {section.text && <p>{section.text}</p>}
        {target && link(<span>{target.title} ↗</span>)}
      </div>}
    </section>;
  });
}
