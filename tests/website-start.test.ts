import test from 'node:test';
import assert from 'node:assert/strict';
import { websiteStartPath } from '../src/lib/website-start';
test('website onboarding accepts only the two internal destinations',()=>{
 assert.equal(websiteStartPath('create'),'/studio/website');
 assert.equal(websiteStartPath('import'),'/studio/import');
 for(const value of [undefined,'','https://evil.example','//evil.example','/admin'])assert.equal(websiteStartPath(value),undefined);
});
