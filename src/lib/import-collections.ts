import * as cheerio from 'cheerio';
import { discoverMedia } from './import-media';
import { readPublicPage } from './importer';
import { importWebsiteUrl, websiteUrl } from './public-url';
import { portfolioCollections } from './portfolio-collections';

export function extractCollection(html: string, page: string, category: string) {
  const $ = cheerio.load(html);
  const origin = new URL(page).origin;
  const seen = new Set<string>();
  return $('.gallery-project[data-url]').toArray().flatMap(element => {
    const project = $(element);
    const title = project.find('.project-meta h2, .project-meta h1').first().text().replace(/\s+/g, ' ').trim().slice(0, 180);
    try {
      const source = websiteUrl(new URL(project.attr('data-url') || '', page).href);
      if (!title || source.origin !== origin || source.pathname === new URL(page).pathname || seen.has(source.href)) return [];
      seen.add(source.href);
      return [{ title, category, source_url: source.href, media: discoverMedia($.html(element), page) }];
    } catch {
      return [];
    }
  });
}

async function readCollectionPage(url: string) {
  try {
    return await readPublicPage(url);
  } catch {
    // Public portfolio hosts can occasionally reject a single request.
    return readPublicPage(url);
  }
}

export async function scanPortfolioCollections(input: string) {
  const root = await readCollectionPage(new URL('/', importWebsiteUrl(input)).href);
  const results = await Promise.allSettled(portfolioCollections.map(async ({ name, path }) => {
    const page = path === '/' ? root : await readCollectionPage(new URL(path, root.url).href);
    if (new URL(page.url).origin !== new URL(root.url).origin) return [];
    return extractCollection(page.html, page.url, name);
  }));
  const missing = results.flatMap((result, index) =>
    result.status === 'rejected' || !result.value.length ? [portfolioCollections[index].name] : []);
  const projects = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  const $ = cheerio.load(root.html);
  const instagram = $('a[href]').toArray().map(link => $(link).attr('href') ?? '').find(href => {
    try { return ['www.instagram.com', 'instagram.com'].includes(new URL(href).hostname); }
    catch { return false; }
  })?.replace(/^http:/i, 'https:') ?? '';
  return { projects, missing, instagram };
}
