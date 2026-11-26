import {redirect} from 'next/navigation';import {configured,currentUser} from '@/lib/supabase';
export const dynamic='force-dynamic';
export const metadata={title:'Studio — Fresnel Studios',robots:{index:false,follow:false}};
export default async function StudioLayout({children}:{children:React.ReactNode}){if(!configured())redirect('/login');const {data:{user}}=await currentUser();if(!user)redirect('/login');return children;}
