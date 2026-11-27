import {FONT_PAIRS,isDark} from './website-theme';
import type {Website} from './website';
export function portfolioLogoSource(site:Website,light?:boolean){if(site.logoMode==='text')return '';const useLight=typeof light==='boolean'?light:isDark(site.theme);return useLight?(site.logoLight||site.logo):(site.logoDark||site.logo);}

export function portfolioWordmark(site:Website){
 const font=site.wordmarkFont==='site'?site.theme.fonts:site.wordmarkFont;
 return {text:site.wordmarkText??(site.name||'Your portfolio'),font:FONT_PAIRS[font].display,spacing:site.wordmarkSpacing??(font==='baskerville'?.355:0)};
}
