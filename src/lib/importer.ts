import {lookup} from 'node:dns/promises';
import https from 'node:https';
import ipaddr from 'ipaddr.js';
import * as cheerio from 'cheerio';
export function publicAddress(address:string){try{return ipaddr.process(address).range()==='unicast'}catch{return false}}
export function websiteUrl(input:string){const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443'))throw new Error('Enter a public HTTPS website URL.');if(ipaddr.isValid(url.hostname.replace(/^\[|\]$/g,''))&&!publicAddress(url.hostname.replace(/^\[|\]$/g,'')))throw new Error('Private addresses cannot be imported.');if(url.hostname==='localhost'||url.hostname.endsWith('.local'))throw new Error('Local addresses cannot be imported.');url.hash='';return url;}
// Pin the socket to an address we checked. Never follow redirects without checking again.
export async function readPublicPage(input:string,redirects=0):Promise<{html:string;url:string}>{
 if(redirects>3)throw new Error('Too many website redirects.');const url=websiteUrl(input);const records=await lookup(url.hostname,{all:true});if(!records.length||records.some(r=>!publicAddress(r.address)))throw new Error('This address is not a public website.');
 return new Promise((resolve,reject)=>{const address=records[0];const request=https.get(url,{hostname:address.address,family:address.family,servername:url.hostname,headers:{'Host':url.host,'User-Agent':'PhotographerSite-Import/1.0','Accept':'text/html'}},response=>{
  if(response.statusCode&&response.statusCode>=300&&response.statusCode<400){response.resume();if(!response.headers.location)return reject(new Error('Invalid website redirect.'));return readPublicPage(new URL(response.headers.location,url).href,redirects+1).then(resolve,reject);}
  if(response.statusCode!==200){response.resume();return reject(new Error(`Website returned ${response.statusCode}.`));}
  if(!response.headers['content-type']?.includes('text/html')){response.resume();return reject(new Error('The URL must point to an HTML page.'));}
  const chunks:Buffer[]=[];let length=0;response.on('data',chunk=>{length+=chunk.length;if(length>3_000_000){response.destroy();reject(new Error('This page is too large to import.'));}else chunks.push(chunk)});response.on('end',()=>resolve({html:Buffer.concat(chunks).toString('utf8'),url:url.href}));response.on('error',reject);
 });request.setTimeout(8000,()=>request.destroy(new Error('The website took too long to respond.')));request.on('error',reject);});
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
export async function previewWebsite(input:string){const first=await readPublicPage(input);const root=extractPage(first.html,first.url);const candidates:ImportCandidate[]=[];const warnings:string[]=[];
 // Bounded preview. Start with project links, then keep the homepage if no project is reachable.
 const links=root.links.filter(l=>!/(\/contact|\/clients|\/about|\/privacy|\/motion|\/personal)\/?$/i.test(l)).slice(0,5);
 const results=await Promise.allSettled(links.map(async link=>{const page=await readPublicPage(link);return extractPage(page.html,page.url).candidate}));
 results.forEach((r,i)=>{if(r.status==='fulfilled')candidates.push(r.value);else warnings.push(`Could not read ${new URL(links[i]).pathname}`)});if(!candidates.length)candidates.push(root.candidate);
 return {source:first.url,candidates,warnings,limited:true};
}
