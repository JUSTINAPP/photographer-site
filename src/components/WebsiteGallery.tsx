import type { GalleryImage } from '@/lib/website';

export default function WebsiteGallery({ images, label }: { images: GalleryImage[]; label: string }) {
  if (!images.length) return null;
  return <section className="campaign-gallery website-photo-gallery" aria-label={label}>
    {images.map((image, index) => <div key={index} className={'campaign-frame-' + image.size}>
      <img className="campaign-media" src={image.url} alt={image.alt} loading="lazy" referrerPolicy="no-referrer" />
    </div>)}
  </section>;
}
