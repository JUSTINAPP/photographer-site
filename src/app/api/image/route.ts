import { resizeImagePreview } from '@/lib/image-preview';
import { createHash } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import { readPublicFile } from '@/lib/importer';
import { websiteUrl } from '@/lib/public-url';
import { imageWidths } from '@/lib/image-display';
export const runtime='nodejs';
export const maxDuration=30;
const resized=unstable_cache(async(source:string,width:number)=>{
 const file=await readPublicFile(source,{accept:'image/jpeg,image/png,image/webp,image/avif,image/tiff',types:['image/jpeg','image/png','image/webp','image/avif','image/tiff'],maxBytes:25000000});
 const bytes=await resizeImagePreview(file.body,width);
 return bytes.toString('base64');
},['fresnel-public-image-v1'],{revalidate:604800});
export async function GET(request:Request){
 const input=new URL(request.url);const width=Number(input.searchParams.get('w'));const source=input.searchParams.get('src')??'';
 try{
  if(source.length>2048||!imageWidths.some(value=>value===width))throw Error();
  const url=websiteUrl(source);
  if(/\/(private|authenticated)\//i.test(url.pathname))throw Error();
  if([...url.searchParams.keys()].some(key=>/token|signature|credential|expires|authorization/i.test(key)))throw Error();
  const bytes=Buffer.from(await resized(url.href,width),'base64');
  const etag='"'+createHash('sha256').update(bytes).digest('hex')+'"';
  const headers={'Content-Type':'image/webp','Cache-Control':'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',ETag:etag,'X-Content-Type-Options':'nosniff'};
  if(request.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers});
  return new Response(new Uint8Array(bytes),{headers});
 }catch{return new Response('Image preview unavailable',{status:400,headers:{'Cache-Control':'no-store'}})}
}
