'use client';
import { useEffect } from 'react';
export default function MarketingMotion(){
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const nodes=document.querySelectorAll('.fh-intro,.fh-benefits article,.fh-migration-copy,.fh-pricing>div,.fh-extras,.fh-faq,.fh-final');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('fh-in-view');observer.unobserve(entry.target)}}),{threshold:.08});
    nodes.forEach(node=>{node.classList.add('fh-reveal');observer.observe(node)});
    return()=>{observer.disconnect();nodes.forEach(node=>node.classList.remove('fh-reveal','fh-in-view'))};
  },[]);
  return null;
}
