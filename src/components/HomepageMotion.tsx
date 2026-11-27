'use client';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {imageDisplayUrl} from '@/lib/image-display';
import {motionKey,type HomeMotion} from '@/lib/home-motion';
import SmartImage from './SmartImage';
export default function HomepageMotion({motion,poster='',preview=false,urls,device}:{motion:HomeMotion;poster?:string;preview?:boolean;device?:'desktop'|'mobile';urls?:{desktop:string;mobile:string}}){
 const [allowed,setAllowed]=useState(false),[playing,setPlaying]=useState(false),[shot,setShot]=useState(0),[mobile,setMobile]=useState(false);const video=useRef<HTMLVideoElement>(null);const root=useRef<HTMLDivElement>(null);
 const useMobile=device?device==='mobile':mobile;
 const editKey=motionKey(motion);
 const encoded=urls||(motion.renderKey===motionKey(motion)&&motion.desktopUrl?{desktop:motion.desktopUrl,mobile:motion.mobileUrl}:null);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),size=matchMedia('(max-width: 650px)');const update=()=>{setAllowed(!q.matches&&!(navigator as Navigator&{connection?:{saveData:boolean}}).connection?.saveData);setMobile(size.matches)};update();q.addEventListener('change',update);size.addEventListener('change',update);return()=>{q.removeEventListener('change',update);size.removeEventListener('change',update)}},[]);
 useEffect(()=>{if(!preview||!root.current)return;const observer=new ResizeObserver(entries=>setMobile(entries[0].contentRect.width<650));observer.observe(root.current);return()=>observer.disconnect()},[preview]);
 const encodedSrc=encoded?(useMobile?encoded.mobile||encoded.desktop:encoded.desktop):'';
 useEffect(()=>{setShot(0);setPlaying(allowed)},[allowed,editKey]);
 useEffect(()=>{if(!playing||encoded||!motion.clips.length)return;const timer=setTimeout(()=>setShot(n=>(n+1)%motion.clips.length),motion.clips[shot]?.duration*1000||2000);return()=>clearTimeout(timer)},[playing,shot,encodedSrc,editKey]);
 useEffect(()=>{if(!video.current)return;if(playing)void video.current.play().catch(()=>setPlaying(false));else video.current.pause()},[playing,encodedSrc,useMobile,shot]);
 const clip=motion.clips[shot];const still=poster||motion.clips.find(c=>c.kind==='photo')?.url||'';
 return <div ref={root} className={'homepage-motion motion-'+motion.style} aria-label={preview?'Opening preview':'Photography opening'}>
 {encoded&&allowed?<video key={encodedSrc} ref={video} src={encodedSrc} muted playsInline loop preload="metadata" poster={still?imageDisplayUrl(still,1280):undefined} onError={()=>setPlaying(false)}/>:allowed&&clip?(clip.kind==='video'?<video key={shot} ref={video} src={clip.url} muted playsInline preload="metadata" onLoadedMetadata={e=>{e.currentTarget.currentTime=clip.start;if(playing)void e.currentTarget.play().catch(()=>setPlaying(false))}} style={{objectPosition:`${clip.focusX}% ${clip.focusY}%`}}/>:<SmartImage key={shot} variant="hero" priority src={clip.url} alt="" className={playing&&clip.move?'motion-push':''} style={{objectPosition:`${clip.focusX}% ${clip.focusY}%`,animationDuration:clip.duration+'s',transformOrigin:`${clip.focusX}% ${clip.focusY}%`,animationPlayState:playing?'running':'paused'}}/>):still?<SmartImage variant="hero" priority src={still} alt=""/>:null}
 {allowed&&<button className="motion-play-control" type="button" onClick={()=>setPlaying(v=>!v)} aria-label={playing?'Pause opening':'Play opening'}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause':'Play'}</button>}
 </div>;
}
