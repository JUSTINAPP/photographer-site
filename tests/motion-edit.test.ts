import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseMotion,motionKey} from '../src/lib/home-motion';
import {toggleMotionShot,ownedMotionPaths,reconcileMotionEdit,removeMotionShot,uniqueMotionMedia} from '../src/lib/motion-edit';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
const studio='11111111-1111-4111-8111-111111111111',page='22222222-2222-4222-8222-222222222222';
const asset={id:studio,name:'Portrait',website_selected:true,kind:'photo' as const,source_url:'https://example.com/portrait.jpg'};
test('clicking media immediately updates the timeline and preserves other shot timing and crops',()=>{
 const original=normaliseMotion({clips:[{...asset,mediaId:page,url:'https://example.com/other.jpg',duration:4,focusX:20}],renderKey:'old',desktopPath:studio+'/motion/'+page+'-desktop.mp4'});
 const added=toggleMotionShot(original,asset);assert.equal(added.clips.length,2);assert.equal(added.clips[1].mediaId,asset.id);assert.equal(added.clips[0].duration,4);assert.equal(added.clips[0].focusX,20);assert.equal(added.renderKey,'');assert.equal(added.desktopPath,'');assert.equal(toggleMotionShot(added,asset).clips.length,1);
});
test('eight-shot selection is the actual timeline, with bounded duration',()=>{
 let motion=normaliseMotion({});for(let i=0;i<8;i++)motion=toggleMotionShot(motion,{...asset,id:`11111111-1111-4111-8111-11111111111${i}`,source_url:`https://example.com/${i}.jpg`});assert.equal(motion.clips.length,8);assert.ok(motion.clips.reduce((n,c)=>n+c.duration,0)<=15);assert.equal(toggleMotionShot(motion,{...asset,id:page,source_url:'https://example.com/ninth.jpg'}),motion);
});
test('named video edits persist with both versions and can be reused without changing the homepage',()=>{
 const motion=normaliseMotion({enabled:true,clips:[{mediaId:studio,url:asset.source_url}],desktopUrl:'https://example.com/desktop.mp4',mobileUrl:'https://example.com/mobile.mp4',desktopPath:studio+'/motion/'+page+'-desktop.mp4',mobilePath:studio+'/motion/'+page+'-mobile.mp4'});motion.renderKey=motionKey(motion);
 assert.equal(ownedMotionPaths(studio,motion),true);assert.equal(ownedMotionPaths(page,motion),false);
 const site=normaliseWebsite({motionLibrary:[{id:studio,name:'Portraits opening',motion}],pageMotion:{[page]:motion},navigation:[{label:'Portraits',page}]});const saved=normaliseWebsite(JSON.parse(JSON.stringify(site)));assert.equal(saved.motionLibrary[0].name,'Portraits opening');assert.equal(saved.motion.enabled,false);assert.equal(saved.pageMotion[page].desktopPath,'');assert.equal(saved.pageMotion[page].mobileUrl,motion.mobileUrl);assert.equal(saved.pageMotion[page].renderKey,motionKey(saved.pageMotion[page]));
 const publicSite=publishWebsiteSnapshot(saved,[{id:page,title:'Portraits',category:'',description:'',image_url:null}]);assert.equal(publicSite.motionLibrary.length,0);assert.equal(publicSite.pageMotion[page].desktopUrl,motion.desktopUrl);
});

test('legacy duplicate IDs and duplicate image URLs repair to one shot without losing the first timing',()=>{
 const duplicate=normaliseMotion({clips:[{mediaId:studio,url:asset.source_url,duration:3,focusX:20},{mediaId:studio,url:asset.source_url,duration:1},{mediaId:page,url:'https://example.com/second.jpg',duration:2},{mediaId:page,url:'https://example.com/second.jpg',duration:2}],renderKey:'old',desktopPath:studio+'/motion/'+page+'-desktop.mp4'});
 const repaired=reconcileMotionEdit(duplicate);assert.equal(repaired.clips.length,2);assert.equal(repaired.clips[0].duration,3);assert.equal(repaired.clips[0].focusX,20);assert.equal(repaired.desktopPath,'');assert.equal(reconcileMotionEdit(repaired),repaired);
 const removed=removeMotionShot(duplicate,duplicate.clips[0]);assert.equal(removed.clips.some(clip=>clip.mediaId===studio),false);
});
test('picker and timeline agree when old imports use different IDs or Squarespace image sizes',()=>{
 const base='https://images.squarespace-cdn.com/content/v1/site/portrait.jpg';
 const original=normaliseMotion({clips:[{mediaId:page,url:base+'?format=1500w',duration:3}]});
 const media={...asset,source_url:base+'?format=2500w'};const repaired=reconcileMotionEdit(original,[media]);assert.equal(repaired.clips[0].mediaId,media.id);assert.equal(repaired.clips[0].duration,3);assert.equal(toggleMotionShot(repaired,media).clips.length,0);assert.equal(uniqueMotionMedia([media,{...media,id:page,source_url:base+'?format=500w'}]).length,1);
 let motion=normaliseMotion({});for(let i=0;i<10;i++){motion=toggleMotionShot(motion,asset);assert.equal(motion.clips.length,1);motion=removeMotionShot(motion,motion.clips[0]);assert.equal(motion.clips.length,0);}
});
