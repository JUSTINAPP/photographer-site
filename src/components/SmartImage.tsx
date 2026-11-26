'use client';
import { useState, type ImgHTMLAttributes } from 'react';
import { imageDisplayUrl, imageWidths } from '@/lib/image-display';
type Props=Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'srcSet'> & {src:string;variant?:'thumb'|'card'|'hero';priority?:boolean};
export default function SmartImage({src,variant='card',priority=false,sizes,loading,onError,...props}:Props){
 const [failed,setFailed]=useState('');const fallback=failed===src;
 const width=variant==='thumb'?480:variant==='hero'?1600:960;
 const transform=imageDisplayUrl(src,width)!==src;
 const candidates=variant==='thumb'?imageWidths.filter(w=>w<=640):imageWidths;
 return <img {...props} data-optimised-image={!fallback} src={fallback?src:imageDisplayUrl(src,width)}
 srcSet={fallback||!transform?undefined:candidates.map(w=>imageDisplayUrl(src,w)+' '+w+'w').join(', ')}
 sizes={sizes??(variant==='thumb'?'(max-width: 700px) 45vw, 280px':variant==='hero'?'100vw':'(max-width: 700px) 100vw, 50vw')}
 loading={priority?'eager':loading??'lazy'} fetchPriority={priority?'high':'auto'} decoding="async"
 onError={event=>{if(!fallback)setFailed(src);onError?.(event)}}/>;
}
