import {requireStudioAccess} from '@/lib/supabase';
import {prepareLogoKit} from '@/lib/logo-kit';
export async function POST(request:Request){
 await requireStudioAccess('edit');
 try{const form=await request.formData();const file=form.get('logo');if(!(file instanceof File)||file.size>2*1024*1024||!file.size)return Response.json({error:'Choose a PNG, JPEG or WebP logo up to 2 MB.'},{status:400});return Response.json(await prepareLogoKit(Buffer.from(await file.arrayBuffer())),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'This file could not be prepared. Try a transparent PNG logo.'},{status:400})}
}
