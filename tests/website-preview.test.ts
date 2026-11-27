import test from 'node:test';
import assert from 'node:assert/strict';
import {draftPreviewUrl,saveThenPreview} from '../src/lib/website-preview';
const studio='11111111-1111-4111-8111-111111111111',page='22222222-2222-4222-8222-222222222222';
test('fresh private preview keeps studio and selected page with a unique revision',()=>{
 const url=new URL(draftPreviewUrl(studio,page,'123'),'https://example.com');assert.equal(url.searchParams.get('campaign'),page);assert.equal(url.searchParams.get('studio'),studio);assert.equal(url.searchParams.get('revision'),'123');assert.equal(url.pathname,'/studio/website/preview');
 assert.ok(draftPreviewUrl(studio,'about','124').includes('about=1'));assert.ok(!draftPreviewUrl(studio,'home','125').includes('campaign='));assert.ok(!draftPreviewUrl(studio,'https://evil.example','126').includes('campaign='));
});
test('preview only opens after save finishes and uses the database-returned draft',async()=>{
 const events:string[]=[];let finish!:(value:{draft:{headline:string}})=>void;const save=new Promise<{draft:{headline:string}}>(resolve=>{finish=resolve});
 const result=saveThenPreview({headline:'Latest typed edit'},async draft=>{events.push(draft.headline);return save},saved=>events.push('Open '+saved.headline));assert.deepEqual(events,['Latest typed edit']);finish({draft:{headline:'Stored latest edit'}});assert.deepEqual(await result,{headline:'Stored latest edit'});assert.deepEqual(events,['Latest typed edit','Open Stored latest edit']);
});
test('failed saves keep the editor open rather than showing an old preview',async()=>{
 let opened=false;await assert.rejects(saveThenPreview({},async()=>({error:'Save failed'}),()=>{opened=true}),/Save failed/);assert.equal(opened,false);
});
