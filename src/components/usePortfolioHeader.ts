'use client';
import {useEffect,useRef,useState} from 'react';
import {headerPresentation} from '@/lib/website-header';
import type {SiteTheme} from '@/lib/website-theme';
export function usePortfolioHeader(theme:SiteTheme,preview=false){
 const root=useRef<HTMLDivElement>(null);const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{const frame=preview?root.current?.closest('.design-preview-frame'):null;const target=frame??window;const update=()=>setScrolled((frame?frame.scrollTop:window.scrollY)>30);update();target.addEventListener('scroll',update,{passive:true});return()=>target.removeEventListener('scroll',update)},[preview]);
 return {root,look:headerPresentation(theme,scrolled)};
}
