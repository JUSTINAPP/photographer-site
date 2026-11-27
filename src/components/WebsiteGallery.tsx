'use client';
import {useState} from 'react';
import {useWebsiteEditing} from './WebsiteEditing';
import SmartImage from '@/components/SmartImage';
import Link from 'next/link';
import {imagePageTarget} from '@/lib/page-images';
import type { GalleryImage, WebsiteProject, Website } from '@/lib/website';

export default function WebsiteGallery({ site, images, label, projects = [], base, onProject, pageId = 'home' }: {
  site:Website; pageId?: string; images: GalleryImage[]; label: string; projects?: WebsiteProject[]; base?: string; onProject?: (id: string) => void;
}) {
  const edit=useWebsiteEditing();const [dragged,setDragged]=useState<number|null>(null);
  function move(from:number,to:number){if(to<0||to>=images.length||from===to)return;const next=[...images];const [item]=next.splice(from,1);next.splice(to,0,item);edit?.gallery(pageId,next);}
  if (!images.length) return null;
  return <section className={"campaign-gallery website-photo-gallery"+(site.galleryLayouts[pageId]==='natural'?' gallery-natural':site.galleryLayouts[pageId]==='cards'?' gallery-cards':'')} aria-label={label} data-page-gallery={pageId}>
    {images.map((image, index) => {
      const target = imagePageTarget(image.link,projects,base||'');
      const photo = <><SmartImage className="campaign-media" src={image.url} alt={image.alt} loading="lazy" referrerPolicy="no-referrer" />{site.galleryLayouts[pageId]==='cards'&&target&&<span className="campaign-cover-label">{image.alt||target.title}</span>}</>;
      return <div key={image.url+'-'+index} className={'campaign-frame-' + image.size} draggable={!!edit} onDragStart={()=>setDragged(index)} onDragOver={event=>{if(edit)event.preventDefault();}} onDrop={event=>{event.preventDefault();if(dragged!==null)move(dragged,index);setDragged(null);}}>
        {edit&&<div className="gallery-frame-tools"><span>Photo {index+1} · drag to reorder</span><button type="button" aria-label={'Move photo '+(index+1)+' up'} disabled={index===0} onClick={()=>move(index,index-1)}>↑</button><button type="button" aria-label={'Move photo '+(index+1)+' down'} disabled={index===images.length-1} onClick={()=>move(index,index+1)}>↓</button><button type="button" aria-label={'Remove photo '+(index+1)+' from page'} onClick={()=>edit.gallery(pageId,images.filter((_,i)=>i!==index))}>Remove</button></div>}
        {target && onProject ? <button type="button" className="website-gallery-link" aria-label={'View ' + target.title} onClick={() => onProject(target.id)}>{photo}</button>
          : target && base ? <Link className="website-gallery-link" href={target.href} aria-label={'View ' + target.title}>{photo}</Link> : photo}
      </div>;
    })}
  </section>;
}
