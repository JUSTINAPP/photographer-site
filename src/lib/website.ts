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

export function normaliseWebsite(input: unknown) {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const field = (key: string, length: number) =>
    typeof data[key] === 'string' ? data[key].trim().slice(0, length) : '';
  const email = field('email', 254);
  const galleries: Record<string, string> = {};
  if (data.galleries && typeof data.galleries === 'object') {
    for (const [id, images] of Object.entries(data.galleries).slice(0, 150)) {
      if (/^[a-f0-9-]{36}$/i.test(id) && typeof images === 'string') {
        const urls = images.slice(0, 24000).split(/\r?\n/).map(websiteImage).filter(Boolean).slice(0, 12);
        if (urls.length) galleries[id] = urls.join('\n');
      }
    }
  }
  return {
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
};
