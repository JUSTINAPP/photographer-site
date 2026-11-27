import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import {normaliseMotion} from '../src/lib/home-motion';
import {motionVideoFilter,MOTION_FPS} from '../src/lib/motion-video-filter';
test('actual rendered push-in moves smoothly without pixel jumps or backwards judder',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'motion-stability-'));
 try{
 const source=join(folder,'dot.png');await sharp(Buffer.from('<svg width="320" height="180"><rect width="320" height="180" fill="black"/><circle cx="80" cy="50" r="9" fill="white"/></svg>')).png().toFile(source);
 const motion=normaliseMotion({style:'calm',clips:[{mediaId:'11111111-1111-4111-8111-111111111111',url:'https://example.com/a.jpg',duration:2,focusX:70,focusY:60}]});const clip=motion.clips[0];
 const render=(filter:string,frames:number)=>{const result=spawnSync(ffmpeg!,['-v','error','-filter_threads','1','-loop','1','-framerate',String(MOTION_FPS),'-i',source,'-frames:v',String(frames),'-vf',filter,'-f','rawvideo','-pix_fmt','gray','pipe:1'],{maxBuffer:10000000,timeout:20000});assert.equal(result.status,0,result.stderr.toString());assert.equal(result.stdout.length,320*180*frames);return result.stdout;};
 const {filter,frames}=motionVideoFilter(motion,clip,320,180);const output=render(filter,frames);assert.equal(frames,60);
 const positions:number[]=[],brightness:number[]=[];for(let n=0;n<frames;n++){let mass=0,xsum=0;for(let y=0;y<180;y++)for(let x=0;x<320;x++){const value=output[n*320*180+y*320+x];mass+=value;xsum+=x*value;}positions.push(xsum/mass);brightness.push(mass);}
 const steps=positions.slice(1).map((x,i)=>x-positions[i]);assert.ok(steps.every(step=>step<0&&step>-.3),'a continuous push must not reverse or jump whole pixels');assert.ok(Math.max(...steps.slice(1).map((step,i)=>Math.abs(step-steps[i])))<.1,'adjacent movements should remain smooth');assert.ok(Math.min(...brightness)>brightness[0]*.95,'quiet edits must not repeatedly flash through black');
 for(const stable of [{...clip,move:false},{...clip,kind:'video' as const}]){const fixed=motionVideoFilter(motion,stable,320,180);const bytes=render(fixed.filter,fixed.frames);assert.deepEqual(bytes.subarray(0,320*180),bytes.subarray(59*320*180,60*320*180),'locked stills and source video must not receive camera movement');}
 }finally{await rm(folder,{recursive:true,force:true})}
});
