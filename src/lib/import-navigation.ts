import * as cheerio from 'cheerio';
import {websiteUrl} from './public-url';
export function extractNavigation(html:string,source:string){
 const $=cheerio.load(html);const root=new URL(source);const seen=new Set<string>();
 const primary=$('nav a[href], [role="navigation"] a[href], .menu a[href], .main-menu a[href], .overlay-menu a[href]');
 return primary.toArray().flatMap(element=>{
  const link=$(element);const label=link.text().replace(/\s+/g,' ').trim().slice(0,80);if(!label||/privacy|cookie|terms|login|sign in/i.test(label))return [];
  try{const raw=link.attr('href')||'';if(raw.startsWith('mailto:'))return [{label,source:raw,kind:'contact' as const}];const url=websiteUrl(new URL(raw,source).href);
   const kind=url.origin!==root.origin?'external' as const:url.pathname==='/'?'home' as const:/^(bio|about)(\b|\s)/i.test(label)?'about' as const:/^contact$/i.test(label)?'contact' as const:'page' as const;
   const key=kind==='page'?url.pathname:kind==='external'?url.href:kind;if(seen.has(key))return [];seen.add(key);return [{label,source:url.href,kind}];
  }catch{return [];}
 }).slice(0,30);
}
