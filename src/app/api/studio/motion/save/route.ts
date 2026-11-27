import {requireStudioAccess} from '@/lib/supabase';
import {saveNamedMotion} from '@/lib/motion-library';
import {revalidatePath} from 'next/cache';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){
 const {db,workspace}=await requireStudioAccess('edit');
 try{
 const body=await request.json();if(body.studio!==workspace.id)return Response.json({error:'The active studio changed. Reopen the editor.'},{status:409});
 const result=await saveNamedMotion(db,workspace.id,{name:body.name,motion:body.motion});
 revalidatePath('/studio/media');revalidatePath('/studio/website');
 return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'The video could not be saved.'},{status:400});}
}
