import test from 'node:test';
import assert from 'node:assert/strict';
import {addPageImage,pageImages,setPageImages,imagePageTarget} from '../src/lib/page-images';
import {normaliseWebsite,publishWebsiteSnapshot,publishedWebsiteWork} from '../src/lib/website';
const id='11111111-1111-4111-8111-111111111111';const project={id,title:'Campaign A',category:'Portfolio',description:'',image_url:'https://example.com/cover.jpg',published:false};
test('adding a campaign cover links it once and avoids a second automatic homepage tile',()=>{
 const site=normaliseWebsite({homepageProjects:[id]});const image={url:project.image_url,size:'grid' as const,alt:project.title,link:id};const next=addPageImage(site,'home',image,[project]);assert.deepEqual(next.homepageProjects,[]);assert.equal(next.homeGallery?.[0].link,id);assert.equal(addPageImage(next,'home',image,[project]).homeGallery?.length,1);
 const published=publishWebsiteSnapshot(normaliseWebsite(next),[project]);assert.equal(publishedWebsiteWork(published,[])[0].id,id);
});
test('an ordinary image can be added, linked, unlinked, reordered and removed on a campaign without changing its source media',()=>{
 const site=normaliseWebsite({homeGallery:[]});const first=addPageImage(site,id,{url:'https://example.com/a.jpg',size:'grid',alt:'A'},[project]);const second=addPageImage(first,id,{url:'https://example.com/b.jpg',size:'wide',alt:'B',link:'home'},[project]);const reordered=setPageImages(second,id,[pageImages(second,id)[1],pageImages(second,id)[0]],[project]);assert.equal(pageImages(normaliseWebsite(reordered),id)[0].link,'home');const unlinked=setPageImages(reordered,id,[{...pageImages(reordered,id)[0],link:undefined}],[project]);assert.equal(pageImages(unlinked,id)[0].link,undefined);assert.equal(pageImages(setPageImages(unlinked,id,[],[project]),id).length,0);assert.deepEqual(site.homeGallery,[]);
});
test('About page images and Home/About link targets survive saving and publication',()=>{
 let site=normaliseWebsite({});site=addPageImage(site,'about',{url:'https://example.com/about.jpg',size:'grid',alt:'About',link:'home'},[]);const saved=normaliseWebsite(JSON.parse(JSON.stringify(site)));assert.equal(publishWebsiteSnapshot(saved,[]).placements.about[0].link,'home');assert.equal(imagePageTarget('home',[],'/david')?.href,'/david');assert.equal(imagePageTarget('about',[],'/david')?.href,'/david?about=1');assert.equal(imagePageTarget('https://bad.example',[],'/david'),null);
});
test('responsive variants reuse a frame and keep its existing display size',()=>{
 const url='https://images.squarespace-cdn.com/content/v1/studio/photo.jpg';let site=normaliseWebsite({homeGallery:[{url,size:'wide',alt:'Photo'}]});site=addPageImage(site,'home',{url:url+'?format=1000w',size:'grid',alt:'Campaign A',link:id},[project]);assert.equal(site.homeGallery?.length,1);assert.equal(site.homeGallery?.[0].size,'wide');assert.equal(site.homeGallery?.[0].url,url);
});
