import type {SupabaseClient} from '@supabase/supabase-js';
import {normaliseMotion,motionReady} from './home-motion';
import {normaliseWebsite} from './website';
import {ownedMotionPaths} from './motion-edit';
export async function saveNamedMotion(db:Pick<SupabaseClient,'from'|'storage'|'rpc'>,studio:string,input:{name:unknown;motion:unknown}){
 const name=typeof input.name==='string'?input.name.trim().slice(0,150):'';if(!name)throw Error('Give this video a name first.');
 const motion=normaliseMotion(input.motion);if(!motionReady(motion)||!ownedMotionPaths(studio,motion))throw Error('Generate the video after your latest changes before saving it to Media.');
 // Never accept client-provided public URLs; derive them from validated studio-owned outputs.
 for(const shape of ['desktop','mobile'] as const){
 const path=motion[shape==='desktop'?'desktopPath':'mobilePath'];const file=await db.storage.from('studio-originals').download(path);if(file.error)throw Error('The generated video could not be found. Generate it again.');
 const stored=await db.storage.from('studio-web-assets').upload(path,file.data,{contentType:'video/mp4',upsert:false,cacheControl:'31536000'});if(stored.error&&String(stored.error.statusCode)!=='409')throw Error('The video could not be saved to Media. Try again.');
 motion[shape==='desktop'?'desktopUrl':'mobileUrl']=db.storage.from('studio-web-assets').getPublicUrl(path).data.publicUrl;
 }
 const asset=await db.from('studio_media').upsert({workspace_id:studio,name,kind:'video',source_url:motion.desktopUrl},{onConflict:'workspace_id,source_url'}).select('id,name,kind,source_url').single();if(asset.error)throw Error('The video files are ready but the Media entry could not be saved. Try again.');
 const stored=await db.from('studio_websites').select('draft').eq('workspace_id',studio).maybeSingle();if(stored.error)throw Error('Could not load saved edits. Try saving again.');
 const current=normaliseWebsite(stored.data?.draft).motionLibrary;const entry={id:asset.data.id,name,motion};const library=[entry,...current.filter(item=>item.id!==entry.id)].slice(0,150);
 const saved=await db.rpc('patch_studio_settings',{studio:studio,patch:{motionLibrary:library}});if(saved.error)throw Error('The video is in Media, but its editable timeline could not be saved. Try saving again.');

 return {entry,media:asset.data};
}
