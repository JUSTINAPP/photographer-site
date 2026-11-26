import * as cheerio from 'cheerio';
import {readPublicFile,readPublicPage} from './importer';
import {importWebsiteUrl,websiteUrl} from './public-url';
export function referenceDigest(html:string,url:string){
 const $=cheerio.load(html);const title=$('title').text().trim().slice(0,180);const nav=$('header a,nav a,[role=navigation] a').map((_,e)=>$(e).text().trim()).get().filter(Boolean).slice(0,30);
 const styles=$('style').map((_,e)=>$(e).text()).get().join('\n').slice(0,10000);
 $('script,noscript,svg,style').remove();
 const structure=$('header,main,section,article,figure,.slider,.slideshow,[class*=gallery],[class*=hero]').slice(0,24).map((_,e)=>({tag:e.tagName,class:$(e).attr('class')?.slice(0,160),heading:$(e).find('h1,h2,h3').first().text().slice(0,120),images:$(e).find('img').length,videos:$(e).find('video').length})).get();
 return {url,title,nav,structure,styles,text:$('body').text().replace(/\s+/g,' ').slice(0,3500),styleLinks:$('link[rel=stylesheet]').map((_,e)=>$(e).attr('href')).get().slice(0,2)};
}
export async function studyReference(input:string){
 const address=importWebsiteUrl(input);const page=await readPublicPage(address.href);const digest=referenceDigest(page.html,page.url);
 const css=await Promise.allSettled(digest.styleLinks.map(async href=>{const url=websiteUrl(new URL(href,page.url).href);if(url.origin!==new URL(page.url).origin)return '';return (await readPublicFile(url.href,{accept:'text/css',types:['text/css','text/plain'],maxBytes:250000})).body.toString('utf8').slice(0,12000)}));
 return {...digest,styleLinks:undefined,externalStyles:css.flatMap(result=>result.status==='fulfilled'?[result.value]:[])};
}
