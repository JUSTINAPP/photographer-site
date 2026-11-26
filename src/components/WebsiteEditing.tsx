'use client';
import TeamAccessSelect from './TeamAccessSelect';
import { createContext, useContext, type ReactNode } from 'react';
import type { Website, WebsiteProject } from '@/lib/website';
export const WebsiteEditing = createContext<null | {site:Website;page:string;update:(patch:Partial<Website>)=>void;project:(id:string,patch:Website['pageCopy'][string])=>void;gallery:(page:string,images:Website['homeGallery'])=>void;sections:(page:string,sections:Website['sections'][string])=>void}>(null);
export const useWebsiteEditing=()=>useContext(WebsiteEditing);
export function EditableRegion({site,id,children}:{site:Website;id:string;children:ReactNode}) {
 const edit=useWebsiteEditing();if(site.hiddenBlocks.includes(id))return null;
 const style=site.blockStyles[id];const sections=edit?.site.sections[edit.page]??[];const sectionIndex=id.startsWith('section:')?sections.findIndex(section=>'section:'+section.id===id):-1;
 function moveSection(to:number){if(!edit)return;const next=[...sections];[next[sectionIndex],next[to]]=[next[to],next[sectionIndex]];edit.sections(edit.page,next);}
 return <div className={'editable-region'+(edit?' is-editing':'')} data-heading-size={style?.heading||undefined} data-body-size={style?.body||undefined} style={{'--edit-heading':(style?.heading||48)+'px','--edit-body':(style?.body||18)+'px'} as React.CSSProperties}>
 {edit&&<div className="region-tools" contentEditable={false}><strong>{id.split(':').pop()?.replaceAll('-',' ')}</strong>{(['heading','body'] as const).map(key=><label key={key}>{key==='heading'?'Heading size':'Text size'}<TeamAccessSelect key={id+key+String(style?.[key]||0)} label={id+' '+key+' size'} name={id+'-'+key} initial={String(style?.[key]||0)} options={[["0","Default"],...(key==='heading'?[24,32,40,48,64,80]:[12,14,16,18,20,24]).map(n=>[String(n),n+'px'] as [string,string])]} onChange={value=>edit.update({blockStyles:{...site.blockStyles,[id]:{...style,[key]:Number(value)}}})}/></label>)}{sectionIndex>=0&&<><button type="button" disabled={sectionIndex===0} onClick={()=>moveSection(sectionIndex-1)}>Move section up</button><button type="button" disabled={sectionIndex===sections.length-1} onClick={()=>moveSection(sectionIndex+1)}>Move section down</button></>}<button type="button" onClick={()=>edit.update({hiddenBlocks:[...site.hiddenBlocks,id]})}>Remove section</button></div>}{children}</div>;
}
export function HomeProjectTools({id,ids}:{id:string;ids:string[]}){
 const edit=useWebsiteEditing();if(!edit)return null;const index=ids.indexOf(id);function move(to:number){const next=[...ids];[next[index],next[to]]=[next[to],next[index]];edit!.update({projectOrder:next});}
 return <div className="gallery-frame-tools"><span>Homepage project</span><button type="button" aria-label={'Move project '+id+' up'} disabled={index<1} onClick={()=>move(index-1)}>↑</button><button type="button" aria-label={'Move project '+id+' down'} disabled={index===ids.length-1} onClick={()=>move(index+1)}>↓</button><button type="button" onClick={()=>edit.update({homepageProjects:ids.filter(key=>key!==id)})}>Remove from homepage</button></div>;
}
