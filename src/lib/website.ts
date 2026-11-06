import { normaliseTheme, PRESETS } from './website-theme';

export const editorialTheme = normaliseTheme(PRESETS.editorial.theme);

export function websiteImage(value: string) {
  if (!value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

export type GalleryImage = { url: string; size: 'grid' | 'wide' | 'screen'; alt: string };
export type WebsiteMedia = { id: string; name: string; source_url: string; kind: 'photo' | 'video'; website_selected: boolean };

const projectId = /^[a-f0-9-]{36}$/i;

export function orderWebsiteProjects(projects: WebsiteProject[], order: string[]) {
  const positions = new Map(order.map((id, index) => [id, index]));
  return [...projects].sort((a, b) => (positions.get(a.id) ?? Infinity) - (positions.get(b.id) ?? Infinity));
}

export function normaliseWebsite(input: unknown) {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const field = (key: string, length: number) =>
    typeof data[key] === 'string' ? data[key].trim().slice(0, length) : '';
  const email = field('email', 254);
  const logo = field('logo', 350000);
  const logoSize = typeof data.logoSize === 'number' && Number.isFinite(data.logoSize) ? Math.round(Math.max(24, Math.min(120, data.logoSize))) : 44;
  const galleries: Record<string, string> = {};
  if (data.galleries && typeof data.galleries === 'object') {
    for (const [id, images] of Object.entries(data.galleries).slice(0, 150)) {
      if (/^[a-f0-9-]{36}$/i.test(id) && typeof images === 'string') {
        const urls = images.slice(0, 24000).split(/\r?\n/).map(websiteImage).filter(Boolean).slice(0, 12);
        if (urls.length) galleries[id] = urls.join('\n');
      }
    }
  }
  const placements: Record<string, GalleryImage[]> = {};
  if (data.placements && typeof data.placements === 'object') {
    for (const [id, items] of Object.entries(data.placements).slice(0, 150)) {
      if (!projectId.test(id) || !Array.isArray(items)) continue;
      placements[id] = items.slice(0, 24).flatMap(item => {
        const url = typeof item?.url === 'string' ? websiteImage(item.url.slice(0, 2048)) : '';
        const size: GalleryImage['size'] = item?.size === 'wide' || item?.size === 'screen' ? item.size : 'grid';
        return url ? [{ url, size, alt: typeof item.alt === 'string' ? item.alt.slice(0, 220) : '' }] : [];
      });
    }
  }
  const covers: Record<string, string> = {};
  if (data.covers && typeof data.covers === 'object') {
    for (const [id, url] of Object.entries(data.covers).slice(0, 150)) {
      if (projectId.test(id) && typeof url === 'string') {
        const safe = websiteImage(url.slice(0, 2048));
        if (safe) covers[id] = safe;
      }
    }
  }
  const projectOrder = Array.isArray(data.projectOrder)
    ? [...new Set(data.projectOrder.filter((id): id is string => typeof id === 'string' && projectId.test(id)).slice(0, 150))]
    : [];
  return {
    placements, covers, projectOrder,
    homepageProjects: Array.isArray(data.homepageProjects)
      ? [...new Set(data.homepageProjects.filter((id): id is string => typeof id === 'string' && projectId.test(id)).slice(0, 150))]
      : null,
    homepageLayout: data.homepageLayout === 'grid' ? 'grid' as const : 'full' as const,
    showIntro: data.showIntro !== false,
    logo: /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(logo) ? logo : '',
    logoSize,
    currentWebsite: websiteImage(field('currentWebsite', 2048)),
    name: field('name', 100),
    headline: field('headline', 220),
    about: field('about', 2500),
    services: field('services', 1500),
    email: /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(email) ? email : '',
    video: websiteImage(field('video', 2048)),
    clients: field('clients', 2000),
    galleries,
    image: websiteImage(field('image', 2048)),
    instagram: websiteImage(field('instagram', 2048)),
    imageAlt: field('imageAlt', 220),
    theme: normaliseTheme(data.theme ?? editorialTheme),
  };
}

export type Website = ReturnType<typeof normaliseWebsite>;

export type WebsiteProject = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  published?: boolean;
};

export function websiteGallery(site: Website, project: string): GalleryImage[] {
  return site.placements[project] ?? (site.galleries[project] || '').split('\n').filter(Boolean)
    .map((url, index) => ({ url, size: index % 3 === 0 ? 'wide' : 'grid', alt: '' }));
}

export function homepageWork(site: Website, projects: WebsiteProject[]) {
  const selected = site.homepageProjects && new Set(site.homepageProjects);
  return orderWebsiteProjects(projects.filter(project => selected ? selected.has(project.id) : project.published !== false), site.projectOrder);
}

export function publishedWebsiteWork(settings: unknown, fallback: WebsiteProject[]) {
  const snapshot = settings && typeof settings === 'object' && 'projectSnapshot' in settings ? settings.projectSnapshot : null;
  if (!Array.isArray(snapshot)) return orderWebsiteProjects(fallback, normaliseWebsite(settings).projectOrder);
  return snapshot.slice(0, 150).flatMap(project => {
    if (!project || typeof project.id !== 'string' || !projectId.test(project.id) || typeof project.title !== 'string') return [];
    return [{
      id: project.id,
      title: project.title.slice(0, 180),
      category: typeof project.category === 'string' ? project.category.slice(0, 80) : '',
      description: typeof project.description === 'string' ? project.description.slice(0, 2000) : null,
      image_url: typeof project.image_url === 'string' ? websiteImage(project.image_url.slice(0, 2048)) || null : null,
    }];
  });
}
