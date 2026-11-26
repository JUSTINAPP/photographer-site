'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
export interface PageTiming {path:string;ms:number;at:number;}
export interface SpeedSnapshot {pages:PageTiming[];lcp?:number;interaction?:number;}
export const speedStorage='fresnel-speed-v1';
export function readSpeed():SpeedSnapshot{try{return JSON.parse(sessionStorage.getItem(speedStorage)||'{"pages":[]}')}catch{return {pages:[]}}}
function save(value:SpeedSnapshot){try{sessionStorage.setItem(speedStorage,JSON.stringify(value));window.dispatchEvent(new Event('fresnel-speed'))}catch{}}
let started:{at:number;url:string}|null=null;
export default function PerformanceMonitor(){
 const pathname=usePathname();const search=useSearchParams().toString();
 useEffect(()=>{
  const click=(event:MouseEvent)=>{const a=(event.target as Element)?.closest?.('a');if(!a||a.target==='_blank'||event.metaKey||event.ctrlKey||event.shiftKey)return;const u=new URL(a.href,location.href);if(u.origin===location.origin&&(u.pathname+u.search)!==(location.pathname+location.search)&&u.pathname.startsWith('/studio'))started={at:performance.now(),url:u.pathname+u.search};};
  document.addEventListener('click',click,true);
  const observers:PerformanceObserver[]=[];
  if(PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')){const o=new PerformanceObserver(list=>{const entry=list.getEntries().at(-1);if(entry)save({...readSpeed(),lcp:entry.startTime})});o.observe({type:'largest-contentful-paint',buffered:true});observers.push(o)}
  if(PerformanceObserver.supportedEntryTypes.includes('event')){const o=new PerformanceObserver(list=>{const max=Math.max(...list.getEntries().map(e=>e.duration));const old=readSpeed();if(max>(old.interaction??0))save({...old,interaction:max})});o.observe({type:'event',buffered:true,durationThreshold:40} as PerformanceObserverInit);observers.push(o)}
  return()=>{document.removeEventListener('click',click,true);observers.forEach(o=>o.disconnect())};
 },[]);
 useEffect(()=>{
  if(pathname==='/login'){sessionStorage.removeItem(speedStorage);started=null;return;}
  if(!started||!pathname.startsWith('/studio'))return;
  let stopped=false;let frame=0;
  const finish=()=>{if(stopped||document.querySelector('[data-page-loading]'))return;frame=requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!started||stopped||started.url!==pathname+(search?'?'+search:''))return;observer.disconnect();const old=readSpeed();save({...old,pages:[...old.pages,{path:pathname,ms:performance.now()-started.at,at:Date.now()}].slice(-20)});started=null;}));};
  const observer=new MutationObserver(finish);observer.observe(document.body,{childList:true,subtree:true});finish();
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect()};
 },[pathname,search]);
 return null;
}
