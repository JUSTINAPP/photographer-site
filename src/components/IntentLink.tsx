'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, type ComponentProps } from 'react';
// Fetch the destination on deliberate hover/focus, rather than preloading every large workspace.
export default function IntentLink(props:ComponentProps<typeof Link>) {
 const router=useRouter();const prefetched=useRef(0);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const prefetch=()=>{if(Date.now()-prefetched.current<20000)return;prefetched.current=Date.now();router.prefetch(String(props.href));};
 return <Link {...props} prefetch={false} onClick={event=>{if(timer.current)clearTimeout(timer.current);props.onClick?.(event)}} onPointerEnter={event=>{props.onPointerEnter?.(event);timer.current=setTimeout(prefetch,100)}} onPointerLeave={event=>{props.onPointerLeave?.(event);if(timer.current)clearTimeout(timer.current)}} onFocus={event=>{props.onFocus?.(event);prefetch()}}/>;
}
