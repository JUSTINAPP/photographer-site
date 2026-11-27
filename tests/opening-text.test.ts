import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
test('opening text can be intentionally blank without falling back to the studio name',()=>{
 const site=normaliseWebsite({name:'Studio name',openingTitle:'',heroLabel:'',openingScrollLabel:'',video:'https://example.com/opening.mp4'});const saved=normaliseWebsite(JSON.parse(JSON.stringify(site)));assert.equal(saved.openingTitle,'');assert.equal(saved.heroLabel,'');assert.equal(saved.openingScrollLabel,'');assert.equal(saved.name,'Studio name');assert.equal(publishWebsiteSnapshot(saved,[]).video,site.video);
});
test('hiding opening text preserves its copy and video for restoring later',()=>{
 const site=normaliseWebsite({openingTitle:'My opening',heroLabel:'Photography',showOpeningText:false,video:'https://example.com/film.mp4'});const published=publishWebsiteSnapshot(site,[]);assert.equal(published.showOpeningText,false);assert.equal(published.openingTitle,'My opening');assert.equal(published.video,site.video);assert.equal(normaliseWebsite({name:'Legacy studio'}).openingTitle,null);
});
