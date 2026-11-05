'use server';
import {revalidatePath} from 'next/cache';import {redirect} from 'next/navigation';import {database,requireStudio} from '@/lib/supabase';import {websiteUrl} from '@/lib/importer';
export async function signOut(){const db=await database();await db.auth.signOut();redirect('/login')}
export async function saveImported(items:{title:string;description:string;image_url:string|null;source_url:string;category:string}[]){
 const {db,workspace}=await requireStudio();if(!Array.isArray(items)||!items.length||items.length>6)throw new Error('Select between one and six projects.');
 const rows=items.map(item=>({workspace_id:workspace.id,title:String(item.title).trim().slice(0,180)||'Untitled project',description:String(item.description).slice(0,2000),source_url:websiteUrl(item.source_url).href,image_url:item.image_url?websiteUrl(item.image_url).href:null,category:String(item.category).slice(0,80),published:false}));
 const {error}=await db.from('projects').upsert(rows,{onConflict:'workspace_id,source_url'});if(error)throw new Error('Projects could not be saved. Please try again.');revalidatePath('/studio');revalidatePath('/studio/projects');return rows.length;
}
export async function setPublished(form:FormData){const {db,workspace}=await requireStudio();const published=form.get('publish')==='true';if(published&&form.get('rights')!=='confirmed')throw new Error('Confirm publication permission first.');const {error}=await db.from('projects').update({published}).eq('id',String(form.get('id'))).eq('workspace_id',workspace.id);if(error)throw new Error('Could not update publication.');revalidatePath('/');revalidatePath('/studio/projects')}
