import type {HomeMotion,MotionClip} from './home-motion';
export const MOTION_FPS=30;
export function motionVideoFilter(motion:HomeMotion,clip:MotionClip,w:number,h:number){
 const frames=Math.max(1,Math.round(clip.duration*MOTION_FPS));
 const scale=`scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}:(iw-ow)*${clip.focusX/100}:(ih-oh)*${clip.focusY/100},setsar=1`;
 let filter=scale+(clip.kind==='video'?',tpad=stop_mode=clone:stop_duration=6':'')+`,fps=${MOTION_FPS},settb=1/${MOTION_FPS},setpts=N`;
 if(clip.kind==='photo'&&clip.move&&motion.style!=='graphic'){
  // Sample a floating-point source window, rather than rounding zoompan's crop
  // to whole/chroma-aligned pixels on each frame. Keep the chosen focal point fixed.
  const zoom=`(1+0.035*in/${Math.max(1,frames-1)})`;
  const x=`W*(1-1/${zoom})*${clip.focusX/100}`,y=`H*(1-1/${zoom})*${clip.focusY/100}`;
  filter+=`,format=yuv444p,perspective=x0='${x}':y0='${y}':x1='${x}+W/${zoom}':y1='${y}':x2='${x}':y2='${y}+H/${zoom}':x3='${x}+W/${zoom}':y3='${y}+H/${zoom}':sense=source:eval=frame:interpolation=cubic`;
 }
 // Cuts do not fade through black: repeated fades looked like flashes between shots.
 return {frames,filter:filter+',format=yuv420p'};
}
