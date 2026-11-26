import test from 'node:test';
import assert from 'node:assert/strict';
import {mediaIdentity} from '../src/lib/import-identity';
import {extractNavigation} from '../src/lib/import-navigation';
import {normaliseWebsite,publishWebsiteSnapshot,homepageWork} from '../src/lib/website';
const id='11111111-1111-4111-8111-111111111111';
test('source menus keep labels, unusual source URLs, external social links and order without duplicates',()=>{
 const html='<nav><a href="/">Intro</a><a href="/portraits/">Portraits</a><a href="/odd-commission-url/">Commissions</a><a href="/bio/">Bio</a><a href="https://instagram.com/studio">Instagram</a><a href="/contact/">Contact</a><a href="javascript:alert(1)">Bad</a></nav><nav><a href="/portraits/">Portraits</a></nav>';
 const nav=extractNavigation(html,'https://photographer.example/');
 assert.deepEqual(nav.map(item=>item.label),['Intro','Portraits','Commissions','Bio','Instagram','Contact']);
 assert.equal(nav[2].source,'https://photographer.example/odd-commission-url/');assert.equal(nav[3].kind,'about');assert.equal(nav[4].kind,'external');assert.equal(nav[5].kind,'contact');
});
test('navigation pages remain reachable when excluded from homepage tiles and edits survive publication',()=>{
 const site=normaliseWebsite({name:'Studio',homepageProjects:[],navigation:[{label:'Portraits',page:id}],pageCopy:{[id]:{title:'New portraits',description:'An edited story'}},hiddenBlocks:['home:introduction'],blockStyles:{'home:opening':{heading:32,body:16}},about:'Biography',introText:'A short homepage intro'});
 const projects=[{id,title:'Imported title',category:'Portraits',description:'Source description',image_url:null,published:false}];
 assert.equal(homepageWork(site,projects).length,0);
 const saved=normaliseWebsite(JSON.parse(JSON.stringify(site)));const publicSite=publishWebsiteSnapshot(saved,projects);
 assert.equal(publicSite.projectSnapshot.length,1);assert.equal(publicSite.projectSnapshot[0].title,'New portraits');assert.equal(publicSite.projectSnapshot[0].description,'An edited story');assert.deepEqual(publicSite.hiddenBlocks,['home:introduction']);assert.equal(publicSite.blockStyles['home:opening'].heading,32);assert.equal(publicSite.about,'Biography');assert.equal(publicSite.introText,'');assert.equal(saved.introText,'A short homepage intro');
});
test('new website controls reject unsafe menu links and unbounded styles while keeping legacy copy',()=>{
 const site=normaliseWebsite({about:'Existing copy',navigation:[{label:'Bad',href:'javascript:alert(1)'},{label:'Intro',page:'home'}],blockStyles:{'home:opening':{heading:99999,body:NaN}},hiddenBlocks:['home:introduction','<script>']});assert.equal(site.navigation.length,1);assert.equal(site.introText,'Existing copy');assert.equal(site.blockStyles['home:opening'].heading,120);assert.equal(site.blockStyles['home:opening'].body,0);assert.deepEqual(site.hiddenBlocks,['home:introduction']);
});
test('a Motion page preserves every film once, including an intentional empty gallery after removal',()=>{
 const films=Array.from({length:6},(_,i)=>'https://player.vimeo.com/video/'+(123456789+i));
 const site=normaliseWebsite({navigation:[{label:'Motion',page:id}],filmGalleries:{[id]:[...films,films[0]]}});
 const publicSite=publishWebsiteSnapshot(site,[{id,title:'Motion',category:'Film',description:'',image_url:null}]);assert.equal(publicSite.filmGalleries[id].length,6);
 assert.deepEqual(normaliseWebsite({...site,filmGalleries:{[id]:[]}}).filmGalleries[id],[]);
});
test('removing a section omits its text from publication while retaining it in the private draft for restore',()=>{
 const section='22222222-2222-4222-8222-222222222222';const site=normaliseWebsite({about:'Private biography',services:'Private services',hiddenBlocks:['about:biography','about:services','section:'+section],sections:{home:[{id:section,heading:'Private block',text:'Private copy',layout:'text'}]}});
 const publicSite=publishWebsiteSnapshot(site,[]);assert.equal(publicSite.about,'');assert.equal(publicSite.services,'');assert.equal(publicSite.sections.home.length,0);assert.equal(site.about,'Private biography');assert.equal(site.sections.home.length,1);
});

test('Vimeo playback options do not duplicate film membership, while private video hashes remain distinct',()=>{assert.equal(mediaIdentity('https://player.vimeo.com/video/123456?h=abc&autoplay=1'),mediaIdentity('https://player.vimeo.com/video/123456?h=abc'));assert.notEqual(mediaIdentity('https://player.vimeo.com/video/123456?h=abc'),mediaIdentity('https://player.vimeo.com/video/123456?h=def'));});
