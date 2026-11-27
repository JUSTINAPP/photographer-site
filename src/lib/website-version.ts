import {normaliseWebsite} from './website';
/** Compare what visitors see, ignoring private storage paths and studio-only templates. */
export function websiteVersion(input:unknown){const site=normaliseWebsite(input);return JSON.stringify({...site,savedLooks:[],motionLibrary:[],currentWebsite:'',motion:{enabled:site.motion.enabled,style:site.motion.style,clips:site.motion.clips,renderKey:site.motion.renderKey}});}
