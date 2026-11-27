import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
import {portfolioLogoSource,portfolioWordmark} from '../src/lib/portfolio-logo';
test('a text logo keeps exact case, a single word or an intentional empty value independently of the studio name',()=>{
 for(const word of ['david mandelberg','studio','MiXeD','']){const saved=normaliseWebsite(JSON.parse(JSON.stringify(normaliseWebsite({name:'David Mandelberg',wordmarkText:word,logoMode:'text'}))));assert.equal(portfolioWordmark(saved).text,word);assert.equal(portfolioWordmark(publishWebsiteSnapshot(saved,[])).text,word);assert.equal(saved.name,'David Mandelberg');}
});
test('the text logo follows website typography unless a separate logo font is selected',()=>{
 const swiss=normaliseWebsite({theme:{fonts:'swiss'}}),serif=normaliseWebsite({...swiss,theme:{...swiss.theme,fonts:'baskerville'}});assert.notEqual(portfolioWordmark(swiss).font,portfolioWordmark(serif).font);assert.match(portfolioWordmark(serif).font,/Libre Baskerville/);assert.equal(portfolioWordmark(serif).spacing,.355);
 const separate=normaliseWebsite({...swiss,wordmarkFont:'baskerville'});assert.equal(portfolioWordmark(separate).font,portfolioWordmark(serif).font);assert.equal(portfolioWordmark(normaliseWebsite({...separate,wordmarkSpacing:.1})).spacing,.1);
});
test('text mode preserves the uploaded logo for switching back and bounds font settings',()=>{
 const site=normaliseWebsite({logo:'data:image/png;base64,AAAA',logoMode:'text',wordmarkFont:'not-a-font',wordmarkSpacing:99});assert.equal(portfolioLogoSource(site),'');assert.equal(site.wordmarkFont,'site');assert.equal(site.wordmarkSpacing,.6);assert.equal(portfolioLogoSource({...site,logoMode:'auto'}),'data:image/png;base64,AAAA');
});
