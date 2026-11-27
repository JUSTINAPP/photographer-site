import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseMotion,motionKey} from '../src/lib/home-motion';
import {toggleMotionShot,ownedMotionPaths} from '../src/lib/motion-edit';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
const studio='11111111-1111-4111-8111-111111111111',page='22222222-2222-4222-8222-222222222222';
const asset={id:studio,name:'Portrait',website_selected:true,kind:'photo' as const,source_url:'https://example.com/portrait.jpg'};
test('clicking media immediately updates the timeline and preserves other shot timing and crops',()=>{
 const original=normaliseMotion({clips:[{...asset,mediaId:page,url:asset.source_url,duration:4,focusX:20}],renderKey:'old',desktopPath:studio+'/motion/'+page+'-desktop.mp4'});
 const added=toggleMotionShot(original,asset);assert.equal(added.clips.length,2);assert.equal(added.clips[1].mediaId,asset.id);assert.equal(added.clips[0].duration,4);assert.equal(added.clips[0].focusX,20);assert.equal(added.renderKey,'');assert.equal(added.desktopPath,'');assert.equal(toggleMotionShot(added,asset).clips.length,1);
});
test('eight-shot selection is the actual timeline, with bounded duration',()=>{
 let motion=normaliseMotion({});for(let i=0;i<8;i++)motion=toggleMotionShot(motion,{...asset,id:`11111111-1111-4111-8111-11111111111${i}`});assert.equal(motion.clips.length,8);assert.ok(motion.clips.reduce((n,c)=>n+c.duration,0)<=15);assert.equal(toggleMotionShot(motion,{...asset,id:page}),motion);
});
test('named video edits persist with both versions and can be reused without changing the homepage',()=>{
 const motion=normaliseMotion({enabled:true,clips:[{mediaId:studio,url:asset.source_url}],desktopUrl:'https://example.com/desktop.mp4',mobileUrl:'https://example.com/mobile.mp4',desktopPath:studio+'/motion/'+page+'-desktop.mp4',mobilePath:studio+'/motion/'+page+'-mobile.mp4'});motion.renderKey=motionKey(motion);
 assert.equal(ownedMotionPaths(studio,motion),true);assert.equal(ownedMotionPaths(page,motion),false);
 const site=normaliseWebsite({motionLibrary:[{id:studio,name:'Portraits opening',motion}],pageMotion:{[page]:motion},navigation:[{label:'Portraits',page}]});const saved=normaliseWebsite(JSON.parse(JSON.stringify(site)));assert.equal(saved.motionLibrary[0].name,'Portraits opening');assert.equal(saved.motion.enabled,false);assert.equal(saved.pageMotion[page].desktopPath,'');assert.equal(saved.pageMotion[page].mobileUrl,motion.mobileUrl);assert.equal(saved.pageMotion[page].renderKey,motionKey(saved.pageMotion[page]));
 const publicSite=publishWebsiteSnapshot(saved,[{id:page,title:'Portraits',category:'',description:'',image_url:null}]);assert.equal(publicSite.motionLibrary.length,0);assert.equal(publicSite.pageMotion[page].desktopUrl,motion.desktopUrl);
});
