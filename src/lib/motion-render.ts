import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {writeFile,readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {readPublicFile} from './importer';
import {motionVideoFilter,MOTION_FPS} from './motion-video-filter';
import type {HomeMotion} from './home-motion';
export async function runVideo(args:string[],timeout=45000){
 if(!ffmpeg)throw Error('Video encoding is unavailable on this server.');
 const binary=ffmpeg;
 await new Promise<void>((resolve,reject)=>{const proc=spawn(binary,args,{stdio:['ignore','ignore','pipe']});let detail='';const timer=setTimeout(()=>{proc.kill('SIGKILL');reject(Error('The video took too long. Try fewer shots or shorter source files.'))},timeout);proc.stderr.on('data',chunk=>{detail=(detail+chunk.toString()).slice(-1500)});proc.on('error',error=>{clearTimeout(timer);reject(error)});proc.on('close',code=>{clearTimeout(timer);if(code===0)resolve();else{console.warn('Motion encode failed',detail.slice(-800));reject(Error('One of the selected videos could not be encoded. Try an MP4 original or photos.'))}})});
}
export async function renderMotion(motion:HomeMotion){
 const folder=await mkdtemp(join(tmpdir(),'fresnel-motion-'));
 try{
 const sources:string[]=[];
 for(const [i,clip] of motion.clips.entries()){
 const file=await readPublicFile(clip.url,{accept:clip.kind==='photo'?'image/*':'video/*',types:clip.kind==='photo'?['image/jpeg','image/png','image/webp','image/avif','image/tiff']:['video/mp4','video/webm','video/quicktime','application/octet-stream'],maxBytes:clip.kind==='photo'?25000000:40000000});
 const path=join(folder,String(i)+(clip.kind==='photo'?'.jpg':'.mp4'));
 await writeFile(path,clip.kind==='photo'?await sharp(file.body,{limitInputPixels:50000000}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).jpeg({quality:88}).toBuffer():file.body);sources.push(path);
 }
 const outputs:{desktop:Buffer;mobile:Buffer}={} as {desktop:Buffer;mobile:Buffer};
 for(const shape of ['desktop','mobile'] as const){
 const [w,h]=shape==='desktop'?[1280,720]:[720,1280];const parts:string[]=[];
 for(const [i,clip] of motion.clips.entries()){
 const dest=join(folder,shape+i+'.mp4');parts.push(dest);const {frames,filter}=motionVideoFilter(motion,clip,w,h);
 await runVideo(['-hide_banner','-loglevel','error','-y','-threads','1','-protocol_whitelist','file,pipe','-format_whitelist','mov,matroska,webm,image2,jpeg_pipe',...(clip.kind==='photo'?['-loop','1','-framerate',String(MOTION_FPS)]:['-ss',String(clip.start)]),'-i',sources[i],'-frames:v',String(frames),'-vf',filter,'-an','-c:v','libx264','-preset','veryfast','-crf','27','-maxrate',shape==='desktop'?'1800k':'1100k','-bufsize',shape==='desktop'?'3600k':'2200k','-threads','1','-r',String(MOTION_FPS),'-movflags','+faststart',dest]);
 }
 const list=join(folder,shape+'.txt');await writeFile(list,parts.map(p=>`file '${p}'`).join('\n'));const output=join(folder,shape+'.mp4');
 await runVideo(['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',output]);outputs[shape]=await readFile(output);if(outputs[shape].length>20000000)throw Error('The opening is too large. Try fewer shots.');
 }
 return outputs;
 }finally{await rm(folder,{recursive:true,force:true})}
}
