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
  return {
    name: field('name', 100),
    headline: field('headline', 220),
    about: field('about', 2500),
    services: field('services', 1500),
    email: /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(email) ? email : '',
    image: websiteImage(field('image', 2048)),
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
