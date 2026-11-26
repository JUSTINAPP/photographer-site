import { requireStudioAccess } from './supabase';
import type { Media, SocialPost, SocialChannel } from '@/components/social-calendar/model';
export interface GrowthRecord {id:string;kind:string;title:string;data:Record<string,string>;created_at:string;}
export async function socialWorkspace() {
 const session=await requireStudioAccess('social');const {db,workspace}=session;
 const [schedule,media,growth]=await Promise.all([
 db.from('studio_schedule').select('*').eq('workspace_id',workspace.id).eq('kind','social').order('day',{nullsFirst:false}).order('local_time'),
 db.from('studio_media').select('id,name,kind,source_url').eq('workspace_id',workspace.id).order('name').order('id').range(0,999),
 db.from('studio_growth_records').select('*').eq('workspace_id',workspace.id).eq('archived',false).order('created_at',{ascending:false})]);
 if(schedule.error||media.error||growth.error)throw Error('The social workspace could not be loaded. Please refresh.');
 const assets=media.data as Media[];
 // Supabase caps an individual response at 1,000 rows. Keep every library asset available.
 for(let offset=1000;assets.length===offset;offset+=1000){
   const page=await db.from('studio_media').select('id,name,kind,source_url').eq('workspace_id',workspace.id).order('name').order('id').range(offset,offset+999);
   if(page.error)throw Error('The media library could not be loaded. Please refresh.');
   assets.push(...page.data as Media[]);if(page.data.length<1000)break;
 }

 const posts:SocialPost[]=schedule.data.map(row=>{
 const ids:string[]=row.details?.mediaIds ?? (row.media_id?[row.media_id]:[]);
 const files=ids.map(id=>assets.find(m=>m.id===id)).filter((m):m is Media=>!!m);
 return {id:row.id,title:row.title,channel:row.category.toLowerCase() as SocialChannel,caption:row.notes,scheduledDate:row.day??'',scheduledTime:row.local_time?.slice(0,5)??'',status:row.status==='posted'?'published':row.status,format:row.details?.format??'grid',contentBrief:row.details?.contentBrief??'',mediaIds:ids,imageUrl:files.find(m=>m.kind==='photo')?.source_url??null,imageUrls:files.filter(m=>m.kind==='photo').map(m=>m.source_url),videoUrl:files.find(m=>m.kind==='video')?.source_url??null};
 });
 return {...session,posts,media:assets,records:growth.data as GrowthRecord[]};
}

export async function growthWorkspace() {
 const session=await requireStudioAccess('social');
 const {data,error}=await session.db.from('studio_growth_records').select('*').eq('workspace_id',session.workspace.id).eq('archived',false).order('created_at',{ascending:false});
 if(error)throw Error('Marketing settings could not be loaded. Please refresh.');
 return {...session,records:data as GrowthRecord[]};
}
