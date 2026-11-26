'use client';
import type {Website} from '@/lib/website';
import {websiteFilms} from '@/lib/website';
import {vimeoEmbed} from '@/lib/import-identity';
import VimeoFilm from './VimeoFilm';
import {useWebsiteEditing} from './WebsiteEditing';
export default function WebsiteFilms({site,page}:{site:Website;page:string}){
 const edit=useWebsiteEditing();const films=websiteFilms(site,page);function save(next:string[]){edit?.update({filmGalleries:{...site.filmGalleries,[page]:next}});}function move(index:number,target:number){const next=[...films];[next[index],next[target]]=[next[target],next[index]];save(next);}
 return <>{films.map((url,index)=><div key={url}><div className="campaign-film">{edit&&<div className="region-tools"><span>Film {index+1}</span><button type="button" disabled={index===0} onClick={()=>move(index,index-1)}>Move film up</button><button type="button" disabled={index===films.length-1} onClick={()=>move(index,index+1)}>Move film down</button><button type="button" onClick={()=>save(films.filter((_,i)=>i!==index))}>Remove film</button></div>}{vimeoEmbed(url)?<VimeoFilm url={url} index={index}/>:<video src={url} controls playsInline preload="metadata" style={{width:'100%'}}/>}</div></div>)}</>;
}
