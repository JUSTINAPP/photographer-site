'use client';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
export default function MobilePortfolioMenu({children,label='Navigation'}:{children:ReactNode;label?:string}){
 const [open,setOpen]=useState(false);const id=useId();const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}if(e.key==='Tab'){const items=root.current?.querySelectorAll<HTMLElement>('a,button,[tabindex="0"]');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open]);
 return <div ref={root} className={'portfolio-mobile-menu'+(open?' is-open':'')}><button ref={trigger} type="button" className="portfolio-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}><span/><span/></button><nav id={id} aria-label={label} className="portfolio-menu-panel" inert={!open} onClick={event=>{if((event.target as Element).closest('a,button'))setOpen(false)}}>{children}</nav></div>;
}
