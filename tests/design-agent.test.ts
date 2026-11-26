import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {cleanDesignPatch,cleanSavedLooks} from '../src/lib/design-agent';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
import {normaliseMotion,motionSeconds,motionKey,motionReady} from '../src/lib/home-motion';
import {prepareLogoKit} from '../src/lib/logo-kit';
import {referenceDigest} from '../src/lib/design-reference';
const id='11111111-1111-4111-8111-111111111111';
test('AI changes allow design controls only and preserve unrelated photographer content',()=>{
 const patch=cleanDesignPatch({logoSize:33,script:'alert(1)',name:'Different photographer',theme:{palette:'custom',bg:'#ffffff',ink:'#fffffe',columns:99,gap:-10}});
 assert.equal(patch.logoSize,33);assert.equal(patch.theme?.columns,4);assert.equal(patch.theme?.gap,0);assert.equal(patch.theme?.palette,'white');assert.equal('script' in patch,false);assert.equal('name' in patch,false);
 const original=normaliseWebsite({name:'Toby',headline:'My original headline',logoSize:44});const changed=normaliseWebsite({...original,...cleanDesignPatch({logoSize:33})});assert.equal(changed.name,'Toby');assert.equal(changed.headline,original.headline);
});
test('named templates persist only bounded design settings, without assets, scripts or duplicated IDs',()=>{
 const looks=cleanSavedLooks([{id,name:'My quiet look',theme:{layout:'gallery',columns:3,heroFit:'contain'},logoSize:36,references:['https://example.com/'],image:'https://other.com/private.jpg'},{id,name:'Duplicate'}]);
 assert.equal(looks.length,1);assert.equal(looks[0].theme.layout,'gallery');assert.equal(looks[0].theme.columns,3);assert.equal('image' in looks[0],false);assert.equal(normaliseWebsite({savedLooks:looks}).savedLooks.length,1);
});
test('motion caps duration, validates inputs and invalidates encodes when timing changes',()=>{
 const m=normaliseMotion({enabled:true,style:'editorial',clips:Array.from({length:8},()=>({mediaId:id,url:'https://example.com/a.jpg',kind:'photo',duration:6,start:-5,focusX:200}))});assert.ok(motionSeconds(m)<=15);assert.ok(m.clips.every(c=>c.duration>=1&&c.start===0&&c.focusX===100));
 const encoded={...m,renderKey:motionKey(m),desktopPath:id+'/motion/'+id+'-desktop.mp4',mobilePath:id+'/motion/'+id+'-mobile.mp4'};assert.equal(motionReady(encoded),true);assert.equal(motionReady({...encoded,style:'graphic'}),false);
 assert.equal(normaliseMotion({clips:[{mediaId:id,url:'javascript:alert(1)'}],desktopPath:'../other/secret'}).clips.length,0);
});
test('reference analysis keeps useful layout evidence while stripping script contents from text',()=>{
 const ref=referenceDigest('<title>Test portfolio</title><body><header><nav><a>Portraits</a></nav></header><main><section class="hero"><img src="a.jpg"><h1>Hello</h1></section></main><script>stealSecrets()</script></body>','https://example.com');assert.equal(ref.title,'Test portfolio');assert.ok(ref.nav.includes('Portraits'));assert.equal(ref.text.includes('stealSecrets'),false);assert.ok(ref.structure.some(s=>s.images===1));
});
test('logo variants preserve artwork alpha while producing black and white versions',async()=>{
 const bytes=await sharp({create:{width:120,height:60,channels:4,background:'#ffffff'}}).composite([{input:await sharp({create:{width:60,height:20,channels:4,background:'#000000'}}).png().toBuffer(),left:20,top:20}]).png().toBuffer();
 const kit=await prepareLogoKit(bytes);const decode=(uri:string)=>Buffer.from(uri.split(',')[1],'base64');const dark=await sharp(decode(kit.dark)).ensureAlpha().raw().toBuffer();const light=await sharp(decode(kit.light)).ensureAlpha().raw().toBuffer();assert.equal(dark.length,light.length);assert.equal(dark[0],20);assert.equal(light[0],255);for(let i=3;i<dark.length;i+=4)assert.equal(dark[i],light[i]);assert.equal((await sharp(decode(kit.icon)).metadata()).width,192);
});
