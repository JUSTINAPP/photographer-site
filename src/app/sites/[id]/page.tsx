import {permanentRedirect,notFound} from 'next/navigation';
import {configured,database} from '@/lib/supabase';
import {publishedAddress} from '@/lib/published-address';
import {renderPublishedWebsite} from '@/components/PublishedWebsite';
export default async function PublishedWebsite({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {id}=await params;
  if(!configured()||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))notFound();
  const db=await database();
  const {data}=await db.rpc('published_studio_address',{site_id:id}).maybeSingle();
  const address=data as {slug:string}|null;
  const view=await searchParams;
  if(address?.slug){const query=new URLSearchParams();for(const [key,value] of Object.entries(view)){if(Array.isArray(value))value.forEach(item=>query.append(key,item));else if(value!==undefined)query.set(key,value);}permanentRedirect(publishedAddress(id,address.slug)+(query.size?'?'+query:''));}
  return renderPublishedWebsite(id,{about:typeof view.about==='string'?view.about:undefined,campaign:typeof view.campaign==='string'?view.campaign:undefined},'/sites/'+id);
}
