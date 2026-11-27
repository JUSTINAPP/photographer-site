import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseWebsite,homepageWork,publishWebsiteSnapshot} from '../src/lib/website';
import {addWebsitePage,PAGE_STARTERS} from '../src/lib/page-starters';
const id='11111111-1111-4111-8111-111111111111';
const project={id,title:'Author page',category:'',description:'Private content',image_url:null,published:true};
test('removed pages cannot be republished through menus, homepage tiles or incoming links; restore retains content',()=>{
 const site=normaliseWebsite({removedPages:[id],homepageProjects:[id],navigation:[{label:'Author',page:id}],homeGallery:[{url:'https://example.com/a.jpg',link:id}],placements:{[id]:[{url:'https://example.com/b.jpg'}]},pageCopy:{[id]:{title:'Edited name'}}});
 const roundtrip=normaliseWebsite(JSON.parse(JSON.stringify(site)));assert.equal(homepageWork(roundtrip,[project]).length,0);
 const published=publishWebsiteSnapshot(roundtrip,[project]);assert.equal(published.projectSnapshot.length,0);assert.equal(published.navigation.length,0);assert.equal(published.placements[id],undefined);assert.equal(published.pageCopy[id],undefined);
 const restored={...roundtrip,removedPages:[]};assert.equal(homepageWork(restored,[project])[0].title,'Edited name');assert.equal(publishWebsiteSnapshot(restored,[project]).navigation[0].label,'Author');assert.equal(restored.placements[id].length,1);
});
test('page starters create empty editable galleries without borrowing another page’s media or opening',()=>{
 for(const style of PAGE_STARTERS){const site=addWebsitePage(normaliseWebsite({navigation:[{label:'Intro',page:'home'}]}),id,'New page',style.id,[]);const saved=normaliseWebsite(site);assert.equal(saved.navigation[1].page,id);assert.ok(saved.hiddenBlocks.includes(id+':opening'));assert.deepEqual(saved.placements[id],[]);assert.deepEqual(saved.filmGalleries[id],[]);assert.equal(saved.galleryLayouts[id],style.id==='natural'?'natural':'grid');}
});
