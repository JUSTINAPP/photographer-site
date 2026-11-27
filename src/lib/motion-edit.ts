import {normaliseMotion,type HomeMotion,type MotionClip} from './home-motion';
import {mediaIdentity} from './import-identity';
import type {WebsiteMedia} from './website';
export function motionAssetIdentity(url:string){try{return mediaIdentity(url)}catch{return url}}
export function uniqueMotionMedia(media:WebsiteMedia[]){const ids=new Set<string>(),urls=new Set<string>();return media.filter(asset=>{const url=motionAssetIdentity(asset.source_url);if(ids.has(asset.id)||urls.has(url))return false;ids.add(asset.id);urls.add(url);return true;});}
function edited(motion:HomeMotion,clips:MotionClip[]){return normaliseMotion({...motion,enabled:true,clips,renderKey:'',desktopPath:'',mobilePath:'',desktopUrl:'',mobileUrl:''});}
/** Repair legacy/AI duplicates before React sees the list. One source photo = one shot. */
export function reconcileMotionEdit(motion:HomeMotion,media:WebsiteMedia[]=[]){
 const library=uniqueMotionMedia(media),ids=new Set<string>(),urls=new Set<string>();const clips:MotionClip[]=[];
 for(const clip of motion.clips){const identity=motionAssetIdentity(clip.url);const asset=library.find(a=>motionAssetIdentity(a.source_url)===identity)||library.find(a=>a.id===clip.mediaId);const next=asset?{...clip,mediaId:asset.id,url:asset.source_url,kind:asset.kind}:clip;const url=motionAssetIdentity(next.url);if(ids.has(next.mediaId)||urls.has(url))continue;ids.add(next.mediaId);urls.add(url);clips.push(next);}
 return JSON.stringify(clips)===JSON.stringify(motion.clips)?motion:edited(motion,clips);
}
export function sameMotionAsset(clip:MotionClip,asset:{id:string;source_url:string}){return clip.mediaId===asset.id||motionAssetIdentity(clip.url)===motionAssetIdentity(asset.source_url);}
export function removeMotionShot(motion:HomeMotion,clip:MotionClip){return edited(motion,motion.clips.filter(item=>!sameMotionAsset(item,{id:clip.mediaId,source_url:clip.url})));}
export function toggleMotionShot(motion:HomeMotion,asset:WebsiteMedia){
 const clean=reconcileMotionEdit(motion);const found=clean.clips.find(c=>sameMotionAsset(c,asset));if(found)return removeMotionShot(clean,found);if(clean.clips.length>=8)return clean;
 return edited(clean,[...clean.clips,{mediaId:asset.id,url:asset.source_url,kind:asset.kind,duration:2,start:0,focusX:50,focusY:50,move:true}]);
}
export function ownedMotionPaths(studio:string,motion:HomeMotion){return [motion.desktopPath,motion.mobilePath].every(path=>path.startsWith(studio+'/motion/'));}
