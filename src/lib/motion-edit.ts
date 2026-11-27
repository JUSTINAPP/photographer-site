import {normaliseMotion,type HomeMotion} from './home-motion';
import type {WebsiteMedia} from './website';
export function toggleMotionShot(motion:HomeMotion,asset:WebsiteMedia){
 const found=motion.clips.some(c=>c.mediaId===asset.id);if(!found&&motion.clips.length>=8)return motion;
 const clips=found?motion.clips.filter(c=>c.mediaId!==asset.id):[...motion.clips,{mediaId:asset.id,url:asset.source_url,kind:asset.kind,duration:2,start:0,focusX:50,focusY:50,move:true}];
 return normaliseMotion({...motion,enabled:true,clips,renderKey:'',desktopPath:'',mobilePath:'',desktopUrl:'',mobileUrl:''});
}
export function ownedMotionPaths(studio:string,motion:HomeMotion){return [motion.desktopPath,motion.mobilePath].every(path=>path.startsWith(studio+'/motion/'));}
