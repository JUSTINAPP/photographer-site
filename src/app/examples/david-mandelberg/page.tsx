import Portfolio,{type PublicProject} from '@/components/Portfolio';
import {configured,database} from '@/lib/supabase';
export const dynamic='force-dynamic';
export default async function Home(){
 let projects:PublicProject[]=[];
 if(configured()&&process.env.PUBLIC_STUDIO_ID){const db=await database();const {data}=await db.from('projects').select('id,title,category,description,image_url,source_url').eq('workspace_id',process.env.PUBLIC_STUDIO_ID).eq('published',true).order('created_at',{ascending:false});projects=data??[];}
 return <Portfolio projects={projects}/>;
}
