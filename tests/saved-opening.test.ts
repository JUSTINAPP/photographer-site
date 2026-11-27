import test from 'node:test';
import assert from 'node:assert/strict';
import {websiteVersion} from '../src/lib/website-version';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
import {normaliseMotion,motionKey} from '../src/lib/home-motion';
import {applySavedOpening,selectedSavedOpening,resolveMotionPreview,persistSavedMotion} from '../src/lib/saved-opening';
const studio='11111111-1111-4111-8111-111111111111',oldId='22222222-2222-4222-8222-222222222222',newId='33333333-3333-4333-8333-333333333333';
function encode(id:string){const m=normaliseMotion({enabled:true,clips:[{mediaId:studio,url:'https://example.com/photo.jpg'}],desktopPath:studio+'/motion/'+id+'-desktop.mp4',mobilePath:studio+'/motion/'+id+'-mobile.mp4',desktopUrl:'https://example.com/'+id+'-desktop.mp4',mobileUrl:'https://example.com/'+id+'-mobile.mp4'});m.renderKey=motionKey(m);return m;}
test('a new encode with the same recipe must never reuse the old signed preview',()=>{
 const old=encode(oldId),next=encode(newId);assert.equal(old.renderKey,next.renderKey);const preview={key:old.renderKey,desktop:'https://example.com/old-signed.mp4',mobile:'https://example.com/old-signed-phone.mp4',desktopPath:old.desktopPath,mobilePath:old.mobilePath};
 assert.equal(resolveMotionPreview(next,preview).desktopUrl,next.desktopUrl);
 assert.equal(resolveMotionPreview({...next,desktopUrl:'',mobileUrl:''},preview).desktopUrl,'');
 assert.equal(resolveMotionPreview({...old,desktopUrl:'',mobileUrl:''},preview).desktopUrl,preview.desktop);
});
test('selecting a named homepage edit replaces both videos and survives save, reload and publication',()=>{
 const entry={id:newId,name:'home page 1',motion:encode(newId)};const site=normaliseWebsite({motion:encode(oldId),motionLibrary:[entry],video:'https://example.com/old-showreel.mp4',hiddenBlocks:['home:opening']});
 const next=applySavedOpening(site,'home',entry);assert.equal(next.motion.desktopUrl,entry.motion.desktopUrl);assert.equal(next.video,'');assert.ok(!next.hiddenBlocks.includes('home:opening'));assert.equal(selectedSavedOpening(next,'home')?.name,'home page 1');
 const saved=normaliseWebsite({...next,motion:persistSavedMotion(next.motion,site.motionLibrary)});assert.equal(selectedSavedOpening(saved,'home')?.id,newId);assert.equal(saved.motion.desktopUrl,entry.motion.desktopUrl);assert.equal(publishWebsiteSnapshot(saved,[]).motion.desktopUrl,entry.motion.desktopUrl);
 assert.equal(persistSavedMotion({...encode(oldId),desktopUrl:'https://example.com/stale-signed.mp4'},site.motionLibrary).desktopUrl,'');
});

test('version status notices replacing a video even when the shots and timings are identical',()=>{
 const original=normaliseWebsite({motion:encode(oldId)}),replacement=normaliseWebsite({motion:encode(newId)});assert.notEqual(websiteVersion(original),websiteVersion(replacement));
 const publicCopy={...replacement,motion:{...replacement.motion,desktopPath:'',mobilePath:'',desktopUrl:'https://storage.example/storage/v1/object/public/studio-web-assets/'+replacement.motion.desktopPath,mobileUrl:'https://storage.example/storage/v1/object/public/studio-web-assets/'+replacement.motion.mobilePath}};
 assert.equal(websiteVersion(replacement),websiteVersion(publicCopy));
});
