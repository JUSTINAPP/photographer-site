import {motionFileIdentity} from './saved-opening';
import {normaliseWebsite} from './website';
/** Compare visitor-visible versions using stable video file identities, excluding expiring preview links and studio-only templates. */
export function websiteVersion(input:unknown){const site=normaliseWebsite(input);return JSON.stringify({...site,savedLooks:[],motionLibrary:[],currentWebsite:'',motion:{enabled:site.motion.enabled,style:site.motion.style,clips:site.motion.clips,renderKey:site.motion.renderKey,desktopFile:motionFileIdentity(site.motion,'desktop'),mobileFile:motionFileIdentity(site.motion,'mobile')}});}
