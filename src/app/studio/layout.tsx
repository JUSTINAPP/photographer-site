import {redirect} from 'next/navigation';import {configured,database} from '@/lib/supabase';
export const dynamic='force-dynamic';
export const metadata={title:'Studio — photographer-site',robots:{index:false,follow:false}};
export default async function StudioLayout({children}:{children:React.ReactNode}){if(!configured())redirect('/login');const db=await database();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');return children;}
