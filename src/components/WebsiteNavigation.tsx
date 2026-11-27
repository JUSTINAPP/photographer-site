'use client';
import Link from 'next/link';
import type {Website} from '@/lib/website';
export default function WebsiteNavigation({site,base='',onPage}:{site:Website;base?:string;onPage?:(id:string)=>void}){
 return <>{site.navigation.filter(item=>!site.removedPages.includes(item.page)).map((item,index)=>item.href?<a key={index} href={item.href} target={item.href.startsWith('https:')?'_blank':undefined} rel="noreferrer">{item.label}</a>:onPage?<button type="button" key={index} onClick={()=>onPage(item.page)}>{item.label}</button>:<Link key={index} href={item.page==='home'?base:item.page==='about'?base+'?about=1':item.page==='contact'?base+'?about=1#contact':base+'?campaign='+item.page}>{item.label}</Link>)}</>;
}
