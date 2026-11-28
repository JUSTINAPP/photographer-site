import { NextRequest, NextResponse } from 'next/server';
import { configured, currentUser } from '@/lib/supabase';
import { websiteStartCookie, websiteStartPath } from '@/lib/website-start';
export async function GET(request:NextRequest){
 const method=request.nextUrl.searchParams.get('method')==='import'?'import':'create';
 const user=configured()?(await currentUser()).data.user:null;
 const response=new NextResponse(null,{status:303,headers:{Location:user?websiteStartPath(method)!:'/signup'}});
 response.cookies.set(websiteStartCookie,user?'':method,{path:'/',httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',maxAge:user?0:86400});
 return response;
}
