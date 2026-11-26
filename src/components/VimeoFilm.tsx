'use client';
import {useEffect,useRef,useState} from 'react';
import type Player from '@vimeo/player';
import {Play,Pause,Volume2,VolumeX,Maximize} from 'lucide-react';
import {cleanFilmEmbed} from '@/lib/film-player';
export default function VimeoFilm({url,index}:{url:string;index:number}){
 const root=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null),player=useRef<Player|null>(null);
 const [ratio,setRatio]=useState(16/9),[playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(0),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;let instance:Player|undefined;
 void import('@vimeo/player').then(async({default:Vimeo})=>{if(!active||!frame.current)return;instance=new Vimeo(frame.current);player.current=instance;
 instance.on('play',()=>{if(active)setPlaying(true)});instance.on('pause',()=>{if(active)setPlaying(false)});instance.on('ended',()=>{if(active)setPlaying(false)});instance.on('timeupdate',({seconds,duration}:{seconds:number;duration:number})=>{if(active){setTime(seconds);setDuration(duration)}});
 await instance.ready();const [width,height,length]=await Promise.all([instance.getVideoWidth(),instance.getVideoHeight(),instance.getDuration()]);if(active){if(width>0&&height>0)setRatio(width/height);setDuration(length);setReady(true);}
 }).catch(()=>{if(active)setError('This film could not load. Open it in the video player below.');});
 return()=>{active=false;player.current=null;void instance?.destroy().catch(()=>{});};
 },[url]);
 async function action(run:(p:Player)=>Promise<unknown>){if(!player.current)return;try{await run(player.current);setError('')}catch{setError('Playback is unavailable here. Open the video player below.')}}
 return <div ref={root} className="film-player"><iframe ref={frame} src={cleanFilmEmbed(url)!} title={'Film '+(index+1)} loading="lazy" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen style={{aspectRatio:ratio}}/>
 <div className="film-controls" aria-label={'Film '+(index+1)+' playback controls'}><button type="button" disabled={!ready} aria-label={(playing?'Pause':'Play')+' film '+(index+1)} onClick={()=>void action(p=>playing?p.pause():p.play())}>{playing?<Pause size={18}/>:<Play size={18}/>}<span>{playing?'Pause':'Play'}</span></button><input aria-label={'Seek film '+(index+1)} type="range" min="0" max={duration||1} step="0.1" value={Math.min(time,duration||1)} disabled={!ready} onChange={e=>{const next=Number(e.target.value);setTime(next);void action(p=>p.setCurrentTime(next));}}/><button type="button" disabled={!ready} aria-label={(muted?'Unmute':'Mute')+' film '+(index+1)} onClick={()=>void action(async p=>{await p.setMuted(!muted);setMuted(!muted);})}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><button type="button" disabled={!ready} aria-label={'Fullscreen film '+(index+1)} onClick={()=>void action(p=>root.current?.requestFullscreen?root.current.requestFullscreen():p.requestFullscreen())}><Maximize size={18}/></button></div>
 {error&&<p role="status" className="film-error">{error} <a href={url} target="_blank" rel="noopener noreferrer">Open video ↗</a></p>}</div>;
}
