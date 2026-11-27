export const MOTION_STYLES={editorial:{label:'Editorial rhythm',description:'A strong opening, varied holds and tiny push-ins. Clean cuts.'},graphic:{label:'Graphic cut',description:'Crisp changes and still frames. Let colour and composition set the pace.'},calm:{label:'Quiet cinema',description:'Longer holds with restrained movement and clean cuts.'}} as const;
export type MotionClip={mediaId:string;url:string;kind:'photo'|'video';duration:number;start:number;focusX:number;focusY:number;move:boolean};
export type HomeMotion={enabled:boolean;style:keyof typeof MOTION_STYLES;clips:MotionClip[];renderKey:string;desktopPath:string;mobilePath:string;desktopUrl:string;mobileUrl:string};
const num=(v:unknown,f:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;
const https=(v:unknown)=>{try{const u=new URL(String(v));return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
export function normaliseMotion(input:unknown):HomeMotion{
 const x=input&&typeof input==='object'?input as Record<string,unknown>:{};const style=typeof x.style==='string'&&Object.hasOwn(MOTION_STYLES,x.style)?x.style as HomeMotion['style']:'editorial';
 const clips:MotionClip[]=Array.isArray(x.clips)?x.clips.slice(0,8).flatMap(c=>{const url=https(c?.url);return url&&/^[a-f0-9-]{36}$/i.test(c?.mediaId)?[{mediaId:c.mediaId,url,kind:c.kind==='video'?'video' as const:'photo' as const,duration:Math.round(num(c.duration,2,1,6)*10)/10,start:Math.round(num(c.start,0,0,300)*10)/10,focusX:num(c.focusX,50,0,100),focusY:num(c.focusY,50,0,100),move:c.move!==false}]:[]}):[];
 const total=clips.reduce((n,c)=>n+c.duration,0);if(total>15){let left=15;for(let i=0;i<clips.length;i++){const remaining=clips.length-i-1;clips[i].duration=Math.round(Math.max(1,Math.min(clips[i].duration*15/total,left-remaining))*10)/10;left-=clips[i].duration;}}
 const path=(v:unknown)=>typeof v==='string'&&/^[a-f0-9-]{36}\/motion\/[a-f0-9-]{36}-(desktop|mobile)\.mp4$/i.test(v)?v:'';
 return {enabled:x.enabled===true,style,clips,renderKey:typeof x.renderKey==='string'?x.renderKey.slice(0,100):'',desktopPath:path(x.desktopPath),mobilePath:path(x.mobilePath),desktopUrl:https(x.desktopUrl),mobileUrl:https(x.mobileUrl)};
}
export function motionKey(m:HomeMotion){return JSON.stringify({style:m.style,clips:m.clips}).split('').reduce((hash,c)=>Math.imul(31,hash)+c.charCodeAt(0)|0,0).toString(36);}
export function motionSeconds(m:HomeMotion){return Math.round(m.clips.reduce((n,c)=>n+c.duration,0)*10)/10;}
export function motionReady(m:HomeMotion){return m.clips.length>0&&m.renderKey===motionKey(m)&&!!m.desktopPath&&!!m.mobilePath;}
