import {requireStudioAccess} from '@/lib/supabase';
import {normaliseMotion,motionKey} from '@/lib/home-motion';
import {renderMotion} from '@/lib/motion-render';
export const runtime='nodejs';export const maxDuration=300;
const active=new Set<string>();
export async function POST(request:Request){
 const {db,workspace}=await requireStudioAccess('edit');if(active.has(workspace.id))return Response.json({error:'An opening is already being generated. Please wait.'},{status:429});
 active.add(workspace.id);try{
 const body=await request.json();const motion=normaliseMotion(body.motion);if(!motion.clips.length)throw Error('Select at least one photo or direct video file.');
 const {data,error}=await db.from('studio_media').select('id,source_url,kind').eq('workspace_id',workspace.id).in('id',motion.clips.map(c=>c.mediaId));if(error)throw Error('Could not read your selected media.');
 for(const clip of motion.clips){const source=data.find(s=>s.id===clip.mediaId);if(!source||source.kind!==clip.kind)throw Error('A selected file is no longer in this studio. Reopen the media picker.');clip.url=source.source_url;if(clip.kind==='video'&&!/\.(mp4|webm|mov)([?#]|$)/i.test(clip.url))throw Error('Vimeo embeds cannot be cut into a video. Upload or link the original MP4 file.');}
 const result=await renderMotion(motion);const token=crypto.randomUUID();const paths:{desktop:string;mobile:string}={desktop:'',mobile:''};const urls:{desktop:string;mobile:string}={desktop:'',mobile:''};
 for(const shape of ['desktop','mobile'] as const){paths[shape]=`${workspace.id}/motion/${token}-${shape}.mp4`;const stored=await db.storage.from('studio-originals').upload(paths[shape],result[shape],{contentType:'video/mp4',upsert:false});if(stored.error)throw Error('The video was encoded but could not be saved. Please try again.');const signed=await db.storage.from('studio-originals').createSignedUrl(paths[shape],3600);if(signed.error)throw Error('The preview could not be opened.');urls[shape]=signed.data.signedUrl;}
 return Response.json({motion:{...motion,renderKey:motionKey(motion),desktopPath:paths.desktop,mobilePath:paths.mobile,desktopUrl:'',mobileUrl:''},preview:urls,bytes:result.desktop.length+result.mobile.length},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'The opening could not be generated.'},{status:502})}finally{active.delete(workspace.id)}
}
