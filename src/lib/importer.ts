import { discoverMedia, type FoundMedia } from './import-media';
import {lookup} from 'node:dns/promises';
import https from 'node:https';
import { publicAddress, websiteUrl } from './public-url';
export { publicAddress, websiteUrl } from './public-url';
import * as cheerio from 'cheerio';
// Pin the socket to an address we checked. Never follow redirects without checking again.
export async function readPublicFile(input: string, options: {
  accept: string; maxBytes: number; types: readonly string[];
}, redirects = 0): Promise<{ body: Buffer; url: string; type: string }> {
  if (redirects > 3) throw new Error('Too many website redirects.');
  const url = websiteUrl(input);
  const records = await lookup(url.hostname, { all: true });
  if (!records.length || records.some(record => !publicAddress(record.address))) {
    throw new Error('This address is not a public website.');
  }
  const address = records[0];
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      hostname: address.address, family: address.family, servername: url.hostname,
      signal: AbortSignal.timeout(8000),
      headers: { Host: url.host, 'User-Agent': 'FresnelStudio-Import/1.0', Accept: options.accept },
    }, response => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400) {
        response.resume();
        const location = response.headers.location;
        if (!location) return reject(new Error('Invalid website redirect.'));
        return Promise.resolve().then(() => readPublicFile(new URL(location, url).href, options, redirects + 1)).then(resolve, reject);
      }
      const type = response.headers['content-type']?.split(';')[0].trim().toLowerCase() || '';
      if (response.statusCode !== 200 || !options.types.includes(type)) {
        response.destroy();
        return reject(new Error('The source did not return a supported file.'));
      }
      const chunks: Buffer[] = [];
      let length = 0;
      response.on('data', (chunk: Buffer) => {
        length += chunk.length;
        if (length > options.maxBytes) {
          response.destroy();
          reject(new Error('This file is too large to import.'));
        } else chunks.push(chunk);
      });
      response.on('end', () => resolve({ body: Buffer.concat(chunks), url: url.href, type }));
      response.on('error', reject);
    });
    request.on('error', reject);
  });
}

export async function readPublicPage(input: string) {
  const file = await readPublicFile(input, { accept: 'text/html', maxBytes: 3_000_000, types: ['text/html'] });
  return { html: file.body.toString('utf8'), url: file.url };
}
export type ImportCandidate={source_url:string;title:string;description:string;image_url:string|null;category:string};
function mediaUrl(input:string|undefined,base:string){if(!input)return null;try{const url=websiteUrl(new URL(input,base).href);if(/\.(svg|gif)(\?|$)/i.test(url.href))return null;return url.href}catch{return null}}
export function extractPage(html:string,url:string):{candidate:ImportCandidate;links:string[]}{
 const $=cheerio.load(html);const title=($('meta[property="og:title"]').attr('content')||$('h1').first().text()||$('title').text()||new URL(url).hostname).trim().slice(0,180);
 const description=($('meta[name="description"]').attr('content')||$('meta[property="og:description"]').attr('content')||'').trim().slice(0,2000);
 let image=mediaUrl($('meta[property="og:image"]').attr('content'),url);
 if(!image){$('img').each((_,element)=>{if(image)return;image=mediaUrl($(element).attr('data-src')||$(element).attr('src'),url);});}
 const base=new URL(url);const links=new Set<string>();$('a[href]').each((_,el)=>{try{const next=websiteUrl(new URL($(el).attr('href')!,url).href);if(next.origin===base.origin&&next.pathname!=='/'&&!/\.(pdf|jpg|png|zip|mp4)$/i.test(next.pathname)&&!/(login|cart|checkout|search)/i.test(next.pathname))links.add(next.href)}catch{}});
 return {candidate:{source_url:url,title,description,image_url:image,category:'Imported'},links:[...links].slice(0,24)};
}
export async function previewWebsite(input: string) {
  const first = await readPublicPage(input);
  const root = extractPage(first.html, first.url);
  const candidates: ImportCandidate[] = [];
  const homepageMedia = discoverMedia(first.html, first.url);
  const pages: { source: string; media: FoundMedia[] }[] = [];
  const media = new Map<string, FoundMedia>(homepageMedia.map(item => [item.url, item]));
  const warnings: string[] = [];
  const links = root.links.filter(link => !/(\/contact|\/clients|\/about|\/privacy)\/?$/i.test(link)).slice(0, 10);
  const results = await Promise.allSettled(links.map(link => readPublicPage(link)));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      warnings.push(`Could not read ${new URL(links[index]).pathname}`);
      return;
    }
    const page = result.value;
    candidates.push(extractPage(page.html, page.url).candidate);
    const assets = discoverMedia(page.html, page.url);
    pages.push({ source: page.url, media: assets });
    for (const item of assets) {
      if (media.size >= 150) break;
      if (!media.has(item.url)) media.set(item.url, item);
    }
  });
  if (!candidates.length) candidates.push(root.candidate);
  return { source: first.url, candidates, homepageMedia, pages, media: [...media.values()], warnings, limited: true };
}
