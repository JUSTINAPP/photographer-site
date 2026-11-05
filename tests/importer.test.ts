import {test} from 'node:test';import assert from 'node:assert/strict';import {publicAddress,websiteUrl,extractPage} from '../src/lib/importer';
test('blocks private, loopback, mapped, reserved and metadata addresses',()=>{for(const ip of ['127.0.0.1','10.0.0.2','169.254.169.254','192.168.1.1','172.16.0.1','::1','fc00::1','::ffff:127.0.0.1','0.0.0.0','100.64.0.1','192.0.2.1'])assert.equal(publicAddress(ip),false,ip);assert.equal(publicAddress('1.1.1.1'),true)});
test('requires public HTTPS without credentials or alternate port',()=>{for(const url of ['http://example.com','file:///etc/passwd','https://localhost/','https://printer.local','https://name:password@example.com','https://example.com:3000'])assert.throws(()=>websiteUrl(url));assert.equal(websiteUrl('https://example.com/#x').href,'https://example.com/')});
test('extracts Squarespace images and same-origin project links without scripts',()=>{const result=extractPage('<html><title>Project</title><meta name="description" content="A campaign"><img data-src="https://images.example.com/work.jpg"><a href="/story/">Story</a><a href="https://other.com">Other</a><a href="javascript:alert(1)">Bad</a></html>','https://example.com/');assert.equal(result.candidate.title,'Project');assert.equal(result.candidate.image_url,'https://images.example.com/work.jpg');assert.deepEqual(result.links,['https://example.com/story/'])});

import { discoverMedia } from '../src/lib/import-media';

test('discovers responsive photos and direct videos, deduplicates, and rejects private URLs', () => {
  const media = discoverMedia(`
    <img src="/small.jpg" srcset="/small.jpg 400w, /large.jpg 1600w" alt="Studio portrait">
    <img data-src="/large.jpg"><img src="https://127.0.0.1/private.jpg">
    <video poster="/poster.jpg"><source src="/reel.mp4"></video>
    <img src="/logo.svg">
  `, 'https://example.com/work');
  assert.deepEqual(media.map(item => [item.url, item.kind, item.name]).sort(), [
    ['https://example.com/large.jpg', 'photo', 'Studio portrait'],
    ['https://example.com/reel.mp4', 'video', 'reel'],
    ['https://example.com/poster.jpg', 'photo', 'poster'],
  ].sort());
});
