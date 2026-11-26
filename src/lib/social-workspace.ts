import { studioBrand, requireStudioAccess } from './supabase';
import type { Media, SocialPost, SocialChannel } from '@/components/social-calendar/model';
export interface GrowthRecord {id:string;kind:string;title:string;data:Record<string,string>;created_at:string;}
export async function socialWorkspace({library=false}:{library?:boolean}={}) {
 const session=await requireStudioAccess('social');const {db,workspace}=session;
 const [schedule,growth,total,preview]=await Promise.all([
 db.from('studio_schedule').select('*').eq('workspace_id',workspace.id).eq('kind','social').order('day',{nullsFirst:false}).order('local_time'),
 db.from('studio_growth_records').select('*').eq('workspace_id',workspace.id).eq('archived',false).order('created_at',{ascending:false}),
 db.from('studio_media').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id),
 library?db.from('studio_media').select('id,name,kind,source_url').eq('workspace_id',workspace.id).order('name').order('id').range(0,119):null]);
 if(schedule.error||growth.error||total.error||preview?.error)throw Error('The social workspace could not be loaded. Please refresh.');
 const referenced=[...new Set(schedule.data.flatMap(row=>(row.details?.mediaIds??(row.media_id?[row.media_id]:[])) as string[]))];
 const batches=await Promise.all(Array.from({length:Math.ceil(referenced.length/100)},(_,i)=>db.from('studio_media').select('id,name,kind,source_url').eq('workspace_id',workspace.id).in('id',referenced.slice(i*100,(i+1)*100))));
 if(batches.some(batch=>batch.error))throw Error('Post media could not be loaded.');
 const assets=[...new Map([...(preview?.data??[]),...batches.flatMap(batch=>batch.data??[])].map(m=>[m.id,m])).values()] as Media[];
 const byId=new Map(assets.map(m=>[m.id,m]));
 const posts:SocialPost[]=schedule.data.map(row=>{
 const ids:string[]=row.details?.mediaIds??(row.media_id?[row.media_id]:[]);const files=ids.map(id=>byId.get(id)).filter((m):m is Media=>!!m);
 return {id:row.id,title:row.title,channel:row.category.toLowerCase() as SocialChannel,caption:row.notes,scheduledDate:row.day??'',scheduledTime:row.local_time?.slice(0,5)??'',status:row.status==='posted'?'published':row.status,format:row.details?.format??'grid',contentBrief:row.details?.contentBrief??'',mediaIds:ids,imageUrl:files.find(m=>m.kind==='photo')?.source_url??null,imageUrls:files.filter(m=>m.kind==='photo').map(m=>m.source_url),videoUrl:files.find(m=>m.kind==='video')?.source_url??null};
 });
 return {...session,posts,media:assets,mediaCount:total.count??0,records:growth.data as GrowthRecord[]};
}
export async function growthWorkspace() {
 const session=await requireStudioAccess('social');
 const [records,website]=await Promise.all([session.db.from('studio_growth_records').select('*').eq('workspace_id',session.workspace.id).eq('archived',false).order('created_at',{ascending:false}),studioBrand(session.workspace.id)]);
 if(records.error)throw Error('Marketing settings could not be loaded. Please refresh.');
 return {...session,studioName:website.data?.draft_name||session.workspace.name,records:records.data as GrowthRecord[]};
}
