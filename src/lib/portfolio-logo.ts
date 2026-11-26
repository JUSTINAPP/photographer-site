import {isDark} from './website-theme';
import type {Website} from './website';
export function portfolioLogoSource(site:Website,light?:boolean){const useLight=typeof light==='boolean'?light:isDark(site.theme);return useLight?(site.logoLight||site.logo):(site.logoDark||site.logo);}
