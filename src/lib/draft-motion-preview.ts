import type {SupabaseClient} from '@supabase/supabase-js';
import {motionReady,type HomeMotion} from './home-motion';
export async function draftMotionPreview(db:Pick<SupabaseClient,'storage'>,workspace:string,motion:HomeMotion){
 if(!motionReady(motion)||![motion.desktopPath,motion.mobilePath].every(path=>path.startsWith(workspace+'/motion/')))return undefined;
 const [desktop,mobile]=await Promise.all([db.storage.from('studio-originals').createSignedUrl(motion.desktopPath,3600),db.storage.from('studio-originals').createSignedUrl(motion.mobilePath,3600)]);
 return desktop.data&&mobile.data?{key:motion.renderKey,desktopPath:motion.desktopPath,mobilePath:motion.mobilePath,desktop:desktop.data.signedUrl,mobile:mobile.data.signedUrl}:undefined;
}
