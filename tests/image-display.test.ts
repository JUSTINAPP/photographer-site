import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { imageDisplayUrl, imageWidth } from '../src/lib/image-display';
import { resizeImagePreview } from '../src/lib/image-preview';
test('display variants resize the CDN URL without changing the original source',()=>{
 const original='https://images.squarespace-cdn.com/content/image.jpg?format=2500w';
 const thumb=new URL(imageDisplayUrl(original,400));assert.equal(thumb.searchParams.get('format'),'480w');assert.equal(original.endsWith('2500w'),true);
 assert.equal(imageWidth(9999),1920);
});
test('signed originals and vector files never enter the public image cache',()=>{
 for(const url of ['https://example.com/private.jpg?token=secret','https://example.com/private.jpg?X-Amz-Signature=secret','https://example.com/logo.svg','/icon.svg'])assert.equal(imageDisplayUrl(url,400),url);
 const proxy=new URL(imageDisplayUrl('https://example.com/public.jpg',320),'https://www.fresnelstudio.com');assert.equal(proxy.pathname,'/api/image');assert.equal(proxy.searchParams.get('w'),'320');
});
test('preview conversion bounds dimensions, strips metadata and leaves source bytes intact',async()=>{
 const original=await sharp({create:{width:2400,height:1600,channels:3,background:'#445566'}}).jpeg().withMetadata({orientation:6}).toBuffer();
 const before=Buffer.from(original);const preview=await resizeImagePreview(original,320);const info=await sharp(preview).metadata();
 assert.equal(info.width,320);assert.equal(info.format,'webp');assert.equal(info.exif,undefined);assert.deepEqual(original,before);assert.ok(preview.length<original.length);
});
test('small originals are not enlarged',async()=>{
 const original=await sharp({create:{width:100,height:80,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).png().toBuffer();const info=await sharp(await resizeImagePreview(original,960)).metadata();assert.equal(info.width,100);assert.equal(info.hasAlpha,true);
});
