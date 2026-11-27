import test from 'node:test';
import assert from 'node:assert/strict';
import {saveNamedMotion} from '../src/lib/motion-library';
import {normaliseMotion,motionKey} from '../src/lib/home-motion';
const studio='11111111-1111-4111-8111-111111111111',token='22222222-2222-4222-8222-222222222222';
function encoded(){const motion=normaliseMotion({enabled:true,clips:[{mediaId:studio,url:'https://example.com/photo.jpg'}],desktopPath:studio+'/motion/'+token+'-desktop.mp4',mobilePath:studio+'/motion/'+token+'-mobile.mp4',desktopUrl:'https://untrusted.example/video.mp4'});motion.renderKey=motionKey(motion);return motion;}
function fake(){const files:string[]=[];let patch:unknown;let row:Record<string,unknown>={};const db={storage:{from:(bucket:string)=>({download:async(path:string)=>{files.push(bucket+'/'+path);return {data:new Blob(['video']),error:null}},upload:async()=>({error:null}),getPublicUrl:(path:string)=>({data:{publicUrl:'https://storage.example/'+path}})})},from:(table:string)=>table==='studio_media'?{upsert:(input:Record<string,unknown>)=>{row=input;return {select:()=>({single:async()=>({data:{id:token,...input},error:null})})}}}:{select:()=>({eq:()=>({maybeSingle:async()=>({data:{draft:{name:'Untouched studio'}},error:null})})})},rpc:async(_name:string,input:unknown)=>{patch=input;return {error:null}}};return {db:db as unknown as Parameters<typeof saveNamedMotion>[0],files,getPatch:()=>patch,getRow:()=>row};}
test('saving a named edit creates one Media item, keeps both variants and patches only the reusable library',async()=>{
 const f=fake();const result=await saveNamedMotion(f.db,studio,{name:' Portraits opening ',motion:encoded()});assert.equal(f.files.length,2);assert.equal(result.entry.name,'Portraits opening');assert.equal(f.getRow().kind,'video');assert.ok(String(f.getRow().source_url).startsWith('https://storage.example/'));assert.ok(result.entry.motion.mobileUrl.endsWith('-mobile.mp4'));const patch=f.getPatch() as {studio:string;patch:Record<string,unknown>};assert.equal(patch.studio,studio);assert.deepEqual(Object.keys(patch.patch),['motionLibrary']);
});
test('foreign or ungenerated outputs and blank names are rejected before accessing storage',async()=>{
 const f=fake();await assert.rejects(saveNamedMotion(f.db,token,{name:'Wrong studio',motion:encoded()}),/Generate/);await assert.rejects(saveNamedMotion(f.db,studio,{name:'',motion:encoded()}),/name/);await assert.rejects(saveNamedMotion(f.db,studio,{name:'Not generated',motion:normaliseMotion({})}),/Generate/);assert.equal(f.files.length,0);
});
