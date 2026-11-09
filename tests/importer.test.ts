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

import { discoverSitemapMedia } from '../src/lib/import-media';
import { mediaIdentity } from '../src/lib/import-identity';

test('finds sitemap gallery photos once across Squarespace size variants and identifies Motion pages', () => {
  const photo = 'https://images.squarespace-cdn.com/content/v1/example/frame.jpg';
  const indexed = discoverSitemapMedia(`<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url><loc>http://example.com/motion</loc>
      <image:image><image:loc>${photo}</image:loc></image:image>
      <image:image><image:loc>${photo.replace('images.squarespace-cdn.com', 'static1.squarespace.com')}?format=1500w</image:loc></image:image>
    </url>
    <url><loc>https://other.example/motion</loc>
      <image:image><image:loc>https://other.example/frame.jpg</image:loc></image:image>
    </url></urlset>`, 'https://example.com/');
  assert.deepEqual(indexed.media.map(item => item.url), [photo]);
  assert.deepEqual(indexed.videoPages, ['https://example.com/motion']);
  assert.equal(mediaIdentity('https://example.com/frame.jpg?format=750w'), 'https://example.com/frame.jpg?format=750w');
});

test('recognises an escaped Squarespace Vimeo embed and keeps its unlisted video hash', () => {
  const media = discoverMedia(`<div data-html="&lt;iframe src=&quot;https://player.vimeo.com/video/123456?h=abc123&amp;amp;autoplay=1&quot;&gt;&lt;/iframe&gt;"></div>
    <iframe src="https://player.vimeo.com/video/123456?h=abc123"></iframe>
    <iframe src="https://player.vimeo.com.example.net/video/123456"></iframe>`, 'https://example.com/motion');
  assert.deepEqual(media.map(({ url, kind }) => ({ url, kind })), [
    { url: 'https://player.vimeo.com/video/123456?h=abc123', kind: 'video' },
  ]);
});
