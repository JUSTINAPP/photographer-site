'use server';
import { revalidatePath } from 'next/cache';
import { requireStudioAccess } from '@/lib/supabase';
import { validDay } from '@/lib/studio-planner';
import { workspaceIdPattern } from '@/lib/studio-access';
import type { SocialPost } from '@/components/social-calendar/model';

const channels: Record<string,string> = { instagram:'Instagram', facebook:'Facebook', linkedin:'LinkedIn', tiktok:'TikTok', event:'Event', article:'Article' };
export async function saveSocialPost(post: SocialPost) {
  const { db, workspace } = await requireStudioAccess('social');
  if ((post.id && !workspaceIdPattern.test(post.id)) || !post.title.trim() || post.title.length > 150 || post.caption.length > 3000 || (post.contentBrief?.length ?? 0)>3000 || !channels[post.channel]
    || !['draft','scheduled','published'].includes(post.status) || !['grid','carousel','reel','story'].includes(post.format ?? 'grid')
    || (post.scheduledDate && !validDay(post.scheduledDate)) || (post.scheduledTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(post.scheduledTime))
    || (post.status === 'scheduled' && (!post.scheduledDate || !post.scheduledTime))) return { error: 'Add a title, and a valid date and time for scheduled posts.' };
  const ids = [...new Set(post.mediaIds ?? [])];
  if (ids.length > 10 || ids.some(id=>!workspaceIdPattern.test(id))) return { error:'Choose up to 10 items from this studio’s media.' };
  if (ids.length) {
    const media = await db.from('studio_media').select('id').eq('workspace_id',workspace.id).in('id',ids);
    if (media.error || media.data?.length !== ids.length) return { error:'One of these files is unavailable in this studio.' };
  }
  if (post.format === 'carousel' && ids.length < 2) return { error:'Choose at least two files for a carousel, or save as Photo.' };
  const values = { workspace_id:workspace.id,kind:'social',title:post.title.trim(),notes:post.caption,day:post.scheduledDate || null,local_time:post.scheduledTime || null,
    category:channels[post.channel],status:post.status === 'published' ? 'posted' : post.status,media_id:ids[0] ?? null,
    details:{format:post.format ?? 'grid',mediaIds:ids,contentBrief:post.contentBrief ?? ''} };
  const query = post.id ? db.from('studio_schedule').update(values).eq('id',post.id).eq('workspace_id',workspace.id).eq('kind','social') : db.from('studio_schedule').insert(values);
  const result = await query.select('id').single();
  if (result.error) return { error:'Your post wasn’t saved. Please try again.' };
  revalidatePath('/studio/social'); revalidatePath('/studio/calendar');
  return { id:result.data.id as string };
}
export async function archiveSocialPost(id: string) {
  const { db, workspace } = await requireStudioAccess('social');
  if (!workspaceIdPattern.test(id)) return { error:'Choose a valid post.' };
  // Keep recoverable drafts rather than permanently deleting creative work.
  const result=await db.from('studio_schedule').update({day:null,local_time:null,status:'draft'}).eq('id',id).eq('workspace_id',workspace.id).eq('kind','social');
  if(result.error)return {error:'Could not unschedule this post.'};
  revalidatePath('/studio/social');revalidatePath('/studio/calendar');return {ok:true};
}
export async function saveGrowthRecord(kind: string, _state: {message:string}, form: FormData) {
  const { db, workspace, platformAdmin } = await requireStudioAccess('social');
  if (!['idea','pillar','guidelines','connection','review'].includes(kind) || (kind === 'connection' && !platformAdmin)) return {message:'Only the Fresnel administrator can verify a new connection.'};
  const id=String(form.get('id')??'');const title=String(form.get('title')??'').trim();
  if ((id&&!workspaceIdPattern.test(id)) || !title || title.length>180) return {message:'Add a title of up to 180 characters.'};
  const data:Record<string,string>={};
  for(const name of ['notes','pillar','voice','photography','palette','cadence','property','url','rating','author']) data[name]=String(form.get(name)??'').trim().slice(0,5000);
  if(kind==='connection' && (!['search-console','website-analytics','google-business','google-ads','instagram'].includes(title)
    || (title==='website-analytics' && !/^\d{1,15}$/.test(data.property))
    || (title==='search-console' && !/^(sc-domain:[a-z0-9.-]+|https:\/\/[a-z0-9.-]+\/?[a-z0-9/_-]*)$/i.test(data.property)))) return {message:'Check the property identifier.'};
  if(data.url) {try {const u=new URL(data.url);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch{return {message:'Use a complete https website address.'};}}
  const values={workspace_id:workspace.id,kind,title,data};
  const query=id ? db.from('studio_growth_records').update(values).eq('id',id).eq('workspace_id',workspace.id).eq('kind',kind)
    : ['connection','guidelines'].includes(kind) ? db.from('studio_growth_records').upsert(values,{onConflict:'workspace_id,kind,title',ignoreDuplicates:false}) : db.from('studio_growth_records').insert(values);
  const {error}=await query;
  if(error) return {message:'Could not save. Please try again.'};
  revalidatePath('/studio/social','layout');revalidatePath('/studio/marketing','layout');return {message:'Saved.'};
}
export async function archiveGrowthRecord(id:string) {
  const {db,workspace}=await requireStudioAccess('social');
  if(!workspaceIdPattern.test(id))return;
  const {error}=await db.from('studio_growth_records').update({archived:true}).eq('id',id).eq('workspace_id',workspace.id).neq('kind','connection');
  if(error)throw Error('Could not archive this item.');revalidatePath('/studio/social','layout');
}
