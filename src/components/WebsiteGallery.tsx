import Link from 'next/link';
import { campaignHref } from '@/lib/website-sections';
import type { GalleryImage, WebsiteProject } from '@/lib/website';

export default function WebsiteGallery({ images, label, projects = [], base, onProject }: {
  images: GalleryImage[]; label: string; projects?: WebsiteProject[]; base?: string; onProject?: (id: string) => void;
}) {
  if (!images.length) return null;
  return <section className="campaign-gallery website-photo-gallery" aria-label={label}>
    {images.map((image, index) => {
      const target = projects.find(project => project.id === image.link);
      const photo = <img className="campaign-media" src={image.url} alt={image.alt} loading="lazy" referrerPolicy="no-referrer" />;
      return <div key={index} className={'campaign-frame-' + image.size}>
        {target && onProject ? <button type="button" className="website-gallery-link" aria-label={'View ' + target.title} onClick={() => onProject(target.id)}>{photo}</button>
          : target && base ? <Link className="website-gallery-link" href={campaignHref(base, target.id)} aria-label={'View ' + target.title}>{photo}</Link> : photo}
      </div>;
    })}
  </section>;
}
