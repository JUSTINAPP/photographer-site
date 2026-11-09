import { importWebsiteUrl } from '@/lib/public-url';
import { mediaIdentity } from '@/lib/import-identity';
import { existingMediaIdentities } from '@/lib/import-library';
import {NextResponse} from 'next/server';import {canEditWebsite} from '@/lib/studio-access';import {requireStudio} from '@/lib/supabase';import {previewWebsite} from '@/lib/importer';
export const runtime='nodejs';export const maxDuration=60;
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Invalid request origin.'},{status:403});
 try{const {db,workspace,role}=await requireStudio(false);if(!canEditWebsite(role))return NextResponse.json({error:'Your access to this studio is view only.'},{status:403});
 const body=await request.text();if(body.length>2048)return NextResponse.json({error:'Request too large.'},{status:413});const {url}=JSON.parse(body);if(typeof url!=='string')throw new Error('Enter a website URL.');const address = importWebsiteUrl(url).href;
 const {data:allowed,error}=await db.rpc('claim_import_preview',{workspace:workspace.id});if(error||!allowed)return NextResponse.json({error:'Please wait one minute before another preview.'},{status:429});
 const [preview, existing] = await Promise.all([previewWebsite(address, true), existingMediaIdentities(db, workspace.id)]);
 const media = preview.media.filter(item => !existing.has(mediaIdentity(item.url)));
 return NextResponse.json({ candidates: preview.candidates, warnings: preview.warnings, media, alreadySaved: preview.media.length - media.length });
 }catch(error){const message=error instanceof Error?error.message:'Import preview failed.';return NextResponse.json({error:message},{status:message.includes('sign in')?401:400})}
}
