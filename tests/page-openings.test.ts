import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
const id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const clip={mediaId:id,url:'https://example.com/portrait.jpg',duration:6};
test('page motion and original proportions survive save and publication independently of home',()=>{
 const site=normaliseWebsite({motion:{enabled:false},pageMotion:{[id]:{enabled:true,clips:Array(8).fill(clip)}},galleryLayouts:{[id]:'natural',home:'grid',bad:'natural',[other]:'random'},navigation:[{label:'Portraits',page:id}]});
 const saved=normaliseWebsite(JSON.parse(JSON.stringify(site)));const published=publishWebsiteSnapshot(saved,[{id,title:'Portraits',category:'People',description:'',image_url:null}]);
 assert.equal(published.galleryLayouts[id],'natural');assert.equal(published.galleryLayouts[other],undefined);assert.equal(published.pageMotion[id].clips.length,8);assert.ok(published.pageMotion[id].clips.reduce((n,c)=>n+c.duration,0)<=15);assert.equal(published.motion.enabled,false);
});
test('removed project opening stays restorable privately and has no public motion payload',()=>{
 const site=normaliseWebsite({hiddenBlocks:[id+':opening'],pageMotion:{[id]:{enabled:true,clips:[clip],desktopUrl:'https://example.com/private.mp4'},[other]:{enabled:true,clips:[clip]}}});
 const published=publishWebsiteSnapshot(site,[{id,title:'Portraits',category:'People',description:'',image_url:null}]);
 assert.equal(site.pageMotion[id].clips.length,1);assert.equal(site.pageMotion[id].desktopPath,'');assert.equal(published.pageMotion[id],undefined);assert.equal(published.pageMotion[other],undefined);assert.ok(published.hiddenBlocks.includes(id+':opening'));
});
