import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanFilmEmbed} from '../src/lib/film-player';
test('cinema player keeps unlisted access hashes while overriding imported player clutter',()=>{
 const url=new URL(cleanFilmEmbed('https://player.vimeo.com/video/123456?h=abc123&title=1&transparent=1')!);
 assert.equal(url.searchParams.get('h'),'abc123');
 for(const key of ['title','byline','portrait','controls','vimeo_logo','transparent'])assert.equal(url.searchParams.get(key),'0');
 assert.equal(url.searchParams.get('autoplay'),null);assert.equal(url.searchParams.get('dnt'),'1');
});
test('cinema controls never accept a non-Vimeo frame',()=>{assert.equal(cleanFilmEmbed('https://example.com/video/123456'),null);assert.equal(cleanFilmEmbed('javascript:alert(1)'),null)});
