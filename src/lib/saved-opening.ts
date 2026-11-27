import type {Website} from './website';
import type {HomeMotion} from './home-motion';
export type MotionPreview={key:string;desktop:string;mobile:string;desktopPath?:string;mobilePath?:string};
/** A recipe can be re-rendered many times; its hash alone does not identify the MP4. */
export function sameMotionFile(a:HomeMotion,b:HomeMotion){return !!a.desktopPath&&a.desktopPath===b.desktopPath&&a.mobilePath===b.mobilePath&&a.renderKey===b.renderKey;}
export function selectedSavedOpening(site:Website,page:string){const motion=page==='home'?site.motion:site.pageMotion[page];return motion?.enabled?site.motionLibrary.find(entry=>sameMotionFile(entry.motion,motion)||(!!motion.desktopUrl&&motion.desktopUrl===entry.motion.desktopUrl&&motion.mobileUrl===entry.motion.mobileUrl)):undefined;}
export function applySavedOpening(site:Website,page:string,entry:Website['motionLibrary'][number]):Website{return {...site,...(page==='home'?{motion:{...entry.motion,enabled:true},video:''}:{pageMotion:{...site.pageMotion,[page]:{...entry.motion,enabled:true}}}),hiddenBlocks:site.hiddenBlocks.filter(key=>key!==page+':opening')};}
export function resolveMotionPreview(motion:HomeMotion,preview?:MotionPreview):HomeMotion{
 if(motion.desktopUrl)return motion;
 if(!preview||preview.key!==motion.renderKey||preview.desktopPath!==motion.desktopPath||preview.mobilePath!==motion.mobilePath)return motion;
 return {...motion,desktopUrl:preview.desktop,mobileUrl:preview.mobile};
}
export function persistSavedMotion(motion:HomeMotion,library:Website['motionLibrary']):HomeMotion{
 const saved=library.find(entry=>sameMotionFile(entry.motion,motion));return {...motion,desktopUrl:saved?.motion.desktopUrl||'',mobileUrl:saved?.motion.mobileUrl||''};
}

export function motionFileIdentity(motion:HomeMotion,shape:'desktop'|'mobile'){
 const path=motion[shape==='desktop'?'desktopPath':'mobilePath'];if(path)return path;
 const source=motion[shape==='desktop'?'desktopUrl':'mobileUrl'];if(!source)return '';
 try{const url=new URL(source);return decodeURIComponent(url.pathname).match(/([a-f0-9-]{36}\/motion\/[a-f0-9-]{36}-(?:desktop|mobile)\.mp4)$/i)?.[1]||url.origin+url.pathname;}catch{return '';}
}
