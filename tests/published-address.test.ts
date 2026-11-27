import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedAddress,validPublishedSlug} from '../src/lib/published-address';
test('published links prefer permanent readable names and retain legacy fallback',()=>{
 assert.equal(publishedAddress('123','tobyburrows'),'/tobyburrows');
 assert.equal(publishedAddress('123'),'/sites/123');
 for(const slug of ['../studio','https://evil.test','/login','toby?about=1','', 'a'.repeat(64)])assert.equal(validPublishedSlug(slug),false);
 assert.equal(publishedAddress('123','../studio'),'/sites/123');
 assert.equal(validPublishedSlug('tobyburrows-2'),true);
});
