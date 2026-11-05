import * as cheerio from 'cheerio';
import { websiteUrl } from './public-url';

export type FoundMedia = { url: string; name: string; kind: 'photo' | 'video' };

/** Adapted from Bowerbird House's site digest for responsive and lazy-loaded images. */
function largestSource(srcset: string) {
  return srcset.split(',').map(part => {
    const [url, size] = part.trim().split(/\s+/);
    return { url, size: parseFloat(size) || 1 };
  }).sort((a, b) => b.size - a.size)[0]?.url;
}

export function discoverMedia(html: string, page: string): FoundMedia[] {
  const $ = cheerio.load(html);
  const found = new Map<string, FoundMedia>();
  function add(raw: string | undefined, kind: FoundMedia['kind'], label = '') {
    if (!raw || found.size >= 100) return;
    try {
      const url = websiteUrl(new URL(raw.trim(), page).href);
      if (url.href.length > 2048 || /\.(?:svg|ico)$/i.test(url.pathname)) return;
      if (kind === 'photo' && /(?:^|[/_-])(?:logo|favicon|sprite|placeholder|pixel)(?:[/_.-]|$)/i.test(url.pathname)) return;
      const filename = url.pathname.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
      const name = (label.trim() || filename || (kind === 'photo' ? 'Imported photo' : 'Imported video')).slice(0, 150);
      if (!found.has(url.href)) found.set(url.href, { url: url.href, kind, name });
    } catch {
      // Ignore malformed or unsupported media URLs.
    }
  }
  $('img').each((_, element) => {
    const image = $(element);
    const set = image.attr('data-srcset') || image.attr('srcset');
    add((set && largestSource(set)) || image.attr('data-src') || image.attr('data-lazy-src') || image.attr('src'), 'photo', image.attr('alt'));
  });
  $('picture source').each((_, element) => {
    const source = $(element);
    add(largestSource(source.attr('data-srcset') || source.attr('srcset') || ''), 'photo');
  });
  $('meta[property="og:image"]').each((_, element) => add($(element).attr('content'), 'photo'));
  $('[style]').each((_, element) => {
    for (const match of ($(element).attr('style') || '').matchAll(/background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(match[1], 'photo');
  });
  $('video, video source').each((_, element) => {
    const media = $(element);
    add(media.attr('src') || media.attr('data-src'), 'video');
    add(media.attr('poster'), 'photo');
  });
  $('meta[property="og:video:secure_url"], meta[property="og:video"]').each((_, element) => {
    const url = $(element).attr('content');
    if (url && /\.(mp4|webm|mov)([?#]|$)/i.test(url)) add(url, 'video');
  });
  $('a[href]').each((_, element) => {
    const url = $(element).attr('href');
    if (url && /\.(mp4|webm|mov)([?#]|$)/i.test(url)) add(url, 'video');
  });
  return [...found.values()];
}
