import * as cheerio from 'cheerio';
import { mediaIdentity, vimeoEmbed } from './import-identity';
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
      const key = mediaIdentity(url.href);
      if (!found.has(key)) found.set(key, { url: url.href, kind, name });
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
  function addEmbed(raw?: string) {
    const url = raw && vimeoEmbed(raw);
    if (url) add(url, 'video', 'Vimeo film ' + new URL(url).pathname.split('/').pop());
  }
  $('iframe[src]').each((_, element) => addEmbed($(element).attr('src')));
  $('[data-html]').each((_, element) => {
    const fragment = cheerio.load($(element).attr('data-html') || '', {}, false);
    fragment('iframe[src]').each((_, frame) => addEmbed(fragment(frame).attr('src')));
  });
  return [...found.values()];
}

export function discoverSitemapMedia(xml: string, page: string) {
  const $ = cheerio.load(xml, { xml: true });
  const origin = new URL(page).origin;
  const media = new Map<string, FoundMedia>();
  const videoPages = new Set<string>();
  let limited = false;
  $('urlset > url').each((_, entry) => {
    try {
      const source = new URL($(entry).children('loc').text().trim(), page);
      if (source.protocol === 'http:') source.protocol = 'https:';
      if (websiteUrl(source.href).origin !== origin) return;
      if (/\/(?:motion|films?|videos?|showreels?)(?:[-/]|$)/i.test(source.pathname)) videoPages.add(source.href);
    } catch {
      return;
    }
    $(entry).children('image\\:image').each((_, image) => {
      try {
        const url = websiteUrl($(image).children('image\\:loc').text().trim());
        if (url.href.length > 2048 || /\.(?:svg|ico)$/i.test(url.pathname) ||
          /(?:^|[/_-])(?:logo|favicon|sprite|placeholder|pixel)(?:[/_.-]|$)/i.test(url.pathname)) return;
        const key = mediaIdentity(url.href);
        if (media.has(key)) return;
        if (media.size >= 1500) { limited = true; return; }
        const filename = url.pathname.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
        const title = $(image).children('image\\:title').text().trim();
        media.set(key, { url: url.href, name: (filename || title || 'Imported photo').slice(0, 150), kind: 'photo' });
      } catch {
        // Ignore unsupported or private media URLs.
      }
    });
  });
  return { media: [...media.values()], videoPages: [...videoPages].slice(0, 8), limited };
}
