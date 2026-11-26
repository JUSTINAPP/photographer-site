import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolioLogoSource} from '../src/lib/portfolio-logo';
import {normaliseTheme} from '../src/lib/website-theme';
import {headerPresentation} from '../src/lib/website-header';
import {cleanDesignPatch} from '../src/lib/design-agent';
import {normaliseWebsite,publishWebsiteSnapshot} from '../src/lib/website';
import {websiteVersion} from '../src/lib/website-version';
import {normaliseMotion,motionKey,motionReady} from '../src/lib/home-motion';
const workspace='11111111-1111-4111-8111-111111111111';
test('tinted campaign header starts black and changes to white on a dark scrolled surface',()=>{
 const theme=normaliseTheme({layout:'campaign',palette:'dark'});const top=headerPresentation(theme,false,true);const scrolled=headerPresentation(theme,true,true);
 assert.equal(top.lightLogo,false);assert.equal(top.color,'#161616');assert.ok(top.background.includes('246,243,236'));assert.equal(top.borderBottom,'none');assert.equal(scrolled.lightLogo,true);assert.equal(scrolled.color,'#ffffff');assert.equal(scrolled.background,'#121212');assert.equal(headerPresentation(normaliseTheme({palette:'dark',headerAppearance:'solid'}),false,true).lightLogo,true);
});
test('AI header requests survive validation and can force a white scroll logo on a light theme',()=>{
 const patch=cleanDesignPatch({theme:{headerLogo:'dark',scrolledHeaderLogo:'light',headerAppearance:'tinted',headerBorder:false}});
 const top=headerPresentation(patch.theme!,false,true),scrolled=headerPresentation(patch.theme!,true,true);assert.equal(top.lightLogo,false);assert.equal(scrolled.lightLogo,true);assert.equal(scrolled.background,'#161616');assert.equal(normaliseTheme({headerLogo:'javascript:bad',headerAppearance:'invalid'}).headerLogo,'auto');
});
test('explicit black logo overrides a dark page palette',()=>{
 const site=normaliseWebsite({name:'Studio',theme:{palette:'dark'},logoDark:'data:image/png;base64,AAAA',logoLight:'data:image/png;base64,BBBB'});
 const dark=portfolioLogoSource(site,false),light=portfolioLogoSource(site,true);assert.ok(dark.includes('base64,AAAA'));assert.ok(light.includes('base64,BBBB'));
});
test('opening survives saving and the published snapshot with its playable public outputs',()=>{
 let motion=normaliseMotion({enabled:true,clips:[{mediaId:workspace,url:'https://example.com/photo.jpg',duration:2,kind:'photo'}],desktopPath:workspace+'/motion/'+workspace+'-desktop.mp4',mobilePath:workspace+'/motion/'+workspace+'-mobile.mp4'});motion={...motion,renderKey:motionKey(motion)};assert.equal(motionReady(motion),true);
 const draft=normaliseWebsite({name:'Studio',motion});const published=normaliseWebsite(JSON.parse(JSON.stringify({...publishWebsiteSnapshot(draft,[]),motion:{...motion,desktopPath:'',mobilePath:'',desktopUrl:'https://example.com/desktop.mp4',mobileUrl:'https://example.com/mobile.mp4'}})));
 assert.equal(published.motion.enabled,true);assert.equal(published.motion.desktopUrl,'https://example.com/desktop.mp4');assert.equal(published.motion.renderKey,motionKey(published.motion));assert.equal(websiteVersion(draft),websiteVersion(published));
 assert.notEqual(websiteVersion({...draft,motion:{...motion,enabled:false}}),websiteVersion(published));
});

test('private draft previews sign both valid studio-owned outputs and reject mixed studio paths',async()=>{
 const {draftMotionPreview}=await import('../src/lib/draft-motion-preview');let count=0;
 const db={storage:{from:()=>({createSignedUrl:async(path:string)=>{count++;return {data:{signedUrl:'https://private.example.com/'+path}}}})}} as unknown as Parameters<typeof draftMotionPreview>[0];
 let motion=normaliseMotion({enabled:true,clips:[{mediaId:workspace,url:'https://example.com/photo.jpg',duration:2}],desktopPath:workspace+'/motion/'+workspace+'-desktop.mp4',mobilePath:workspace+'/motion/'+workspace+'-mobile.mp4'});motion={...motion,renderKey:motionKey(motion)};
 assert.ok((await draftMotionPreview(db,workspace,motion))?.desktop);assert.equal(count,2);
 assert.equal(await draftMotionPreview(db,'99999999-9999-4999-8999-999999999999',motion),undefined);assert.equal(count,2);
});
test('About headings, client names and services survive save and publication without changing the studio name',()=>{
 const draft=normaliseWebsite({name:'Toby Burrows',aboutTitle:'Meet Toby',aboutLabel:'Behind the lens',about:'Portraits and stories.\nBased in Sydney.',clientsHeading:'Collaborators',clients:'Client A\nClient B',servicesLabel:'What I do',servicesHeading:'Photography & film',services:'Portraits\nCampaigns'});
 const saved=normaliseWebsite(JSON.parse(JSON.stringify(draft)));
 const published=publishWebsiteSnapshot(saved,[]);
 for(const key of ['aboutTitle','aboutLabel','about','clientsHeading','clients','servicesLabel','servicesHeading','services'] as const) assert.equal(published[key],draft[key]);
 assert.equal(published.name,'Toby Burrows');
 assert.notEqual(websiteVersion(draft),websiteVersion({...draft,aboutLabel:'Another label'}));
 assert.equal(normaliseWebsite({}).aboutLabel,'About the studio');
 assert.equal(normaliseWebsite({aboutLabel:''}).aboutLabel,'');
});
