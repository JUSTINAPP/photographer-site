'use client';
import {useEffect} from 'react';
import type {Website} from '@/lib/website';
export default function WebsiteIdentity({site,preview=false}:{site:Website;preview?:boolean}){
 useEffect(()=>{if(preview||!site.favicon)return;const before=document.title;if(site.name)document.title=site.name;const links=[...document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')];links.forEach(l=>l.disabled=true);const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';const media=matchMedia('(prefers-color-scheme: dark)');const update=()=>{icon.href=media.matches&&site.faviconLight?site.faviconLight:site.favicon};update();media.addEventListener('change',update);document.head.append(icon);return()=>{icon.remove();links.forEach(l=>l.disabled=false);document.title=before;media.removeEventListener('change',update)}},[site.name,site.favicon,site.faviconLight,preview]);return null;
}
