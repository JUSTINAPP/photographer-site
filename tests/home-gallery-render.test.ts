import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import * as cheerio from 'cheerio';
import {normaliseWebsite} from '../src/lib/website';
// Render the real template components outside Next, ignoring their stylesheet imports.
const require=createRequire(import.meta.url);require.extensions['.css']=()=>{};Object.assign(globalThis,{React});
const templates=[require('../src/components/GalleryWebsite').default,require('../src/components/CampaignWebsite').default,require('../src/components/EditorialWebsite').default];
const id='11111111-1111-4111-8111-111111111111';
test('all three templates render added homepage images below an opening and keep campaign links in public and preview views',()=>{
 for(const [index,Component] of templates.entries())for(const preview of [false,true]){
  const site=normaliseWebsite({name:'Studio',image:'https://example.com/poster.jpg',theme:{layout:index===0?'gallery':index===1?'campaign':undefined},homepageProjects:[],homeGallery:[{url:'https://example.com/a.jpg',size:'grid',alt:'Photo A',link:id},{url:'https://example.com/b.jpg',size:'grid',alt:'Photo B'}],motion:{enabled:true,clips:[{mediaId:id,url:'https://example.com/poster.jpg',duration:2}]}});
  const html=renderToStaticMarkup(React.createElement(Component,{site,projects:[],allProjects:[{id,title:'Campaign A',category:'Portfolio',image_url:'https://example.com/a.jpg'}],view:{},preview,base:'/studio-example',onPreviewPage:preview?()=>{}:undefined,onProject:preview?()=>{}:undefined}));const $=cheerio.load(html);const gallery=$('[data-page-gallery="home"]');assert.equal(gallery.length,1,'template '+index+' must render its homepage gallery');assert.equal(gallery.find('img').length,2);assert.equal(gallery.find('img[alt="Photo B"]').length,1);assert.equal(preview?gallery.find('button[aria-label="View Campaign A"]').length:gallery.find('a[href="/studio-example?campaign='+id+'"]').length,1);
 }
});
