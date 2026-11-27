import test from 'node:test';
import assert from 'node:assert/strict';
import {applyOriginalPortfolio,projectSourceKey,type OriginalPortfolioPlan} from '../src/lib/original-portfolio';
import {normaliseWebsite,publishWebsiteSnapshot,publishedWebsiteWork} from '../src/lib/website';
const one='11111111-1111-4111-8111-111111111111',two='22222222-2222-4222-8222-222222222222',parent='33333333-3333-4333-8333-333333333333';
const url='https://images.squarespace-cdn.com/content/v1/studio/photo.jpg';
const plan:OriginalPortfolioPlan={source:'https://www.davidmandelberg.com/',pages:[{id:one,title:'RUSSH',category:'Portfolio',source_url:'https://www.davidmandelberg.com/russh/',photos:[url,url+'?format=1000w'],film:''},{id:two,title:'Campaign B',category:'Advertising',source_url:'https://www.davidmandelberg.com/campaign-b/',photos:['https://example.com/b.jpg'],film:''}],parents:[{id:parent,name:'Advertising'}],instagram:'https://www.instagram.com/example',unmatched:0,missing:[]};
test('matching the source reuses IDs and URLs, links covers to campaigns and is repeatable without duplicates',()=>{
 const site=normaliseWebsite({name:'David',motionLibrary:[],homeGallery:[{url:'https://example.com/old.jpg',size:'grid'}],hiddenBlocks:[],placements:{[one]:[{url,alt:'Existing alt text',size:'wide'}]}});
 const next=applyOriginalPortfolio(site,plan,false);
 assert.equal(next.homeGallery?.length,1);assert.equal(next.homeGallery?.[0].link,one);assert.equal(next.placements[one].length,1);assert.equal(next.placements[one][0].alt,'Existing alt text');assert.equal(next.placements[parent][0].link,two);assert.equal(next.galleryLayouts.home,'cards');assert.equal(next.galleryLayouts[one],'natural');assert.ok(next.hiddenBlocks.includes('home:opening'));assert.deepEqual(next.homepageProjects,[]);assert.deepEqual(applyOriginalPortfolio(next,plan,false),next);
 const projects=plan.pages.map(p=>({id:p.id,title:p.title,category:p.category,image_url:p.photos[0],description:'',published:false})).concat([{id:parent,title:'Advertising',category:'Advertising',image_url:null as unknown as string,description:'',published:false}]);
 const published=publishWebsiteSnapshot(next,projects);assert.equal(publishedWebsiteWork(published,[]).length,3);assert.equal(published.placements[one].length,1);
});
test('keeping the opening preserves the chosen video and saved library while matching the grid',()=>{
 const site=normaliseWebsite({video:'https://example.com/opening.mp4',hiddenBlocks:['home:opening']});const next=applyOriginalPortfolio(site,plan,true);assert.equal(next.video,site.video);assert.ok(!next.hiddenBlocks.includes('home:opening'));assert.deepEqual(next.motionLibrary,site.motionLibrary);
});
test('project matching ignores www and trailing slashes without merging different hosts or campaigns',()=>{
 assert.equal(projectSourceKey('https://www.davidmandelberg.com/russh/'),projectSourceKey('https://davidmandelberg.com/russh'));assert.notEqual(projectSourceKey('https://other.com/russh'),projectSourceKey('https://davidmandelberg.com/russh'));assert.notEqual(projectSourceKey('https://davidmandelberg.com/beth'),projectSourceKey('https://davidmandelberg.com/russh'));
});
