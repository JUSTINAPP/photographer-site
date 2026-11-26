import { requireStudioAccess } from '@/lib/supabase';
export async function GET(request:Request){
 const {db,workspace}=await requireStudioAccess('social');
 if(new URL(request.url).searchParams.get('studio')!==workspace.id)return Response.json({error:'The active studio changed. Refresh this page.'},{status:409,headers:{'Cache-Control':'no-store'}});
 const assets=[];
 for(let offset=0;;offset+=1000){
  const {data,error}=await db.from('studio_media').select('id,name,kind,source_url').eq('workspace_id',workspace.id).order('name').order('id').range(offset,offset+999);
  if(error)return Response.json({error:'The media library could not be loaded.'},{status:503,headers:{'Cache-Control':'no-store'}});
  assets.push(...data);if(data.length<1000)break;
 }
 return Response.json({media:assets},{headers:{'Cache-Control':'private, no-store'}});
}
