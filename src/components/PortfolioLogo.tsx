import SmartImage from './SmartImage';
import {isDark} from '@/lib/website-theme';
import type {Website} from '@/lib/website';
export default function PortfolioLogo({site,light=false}:{site:Website;light?:boolean}){
 const dark=light||isDark(site.theme);
 const logo=dark?(site.logoLight||site.logo):(site.logoDark||site.logo);
 return logo?<SmartImage className="portfolio-logo" src={logo} alt={site.name||'Portfolio'} style={{height:site.logoSize}}/>:<span style={{fontSize:Math.max(14,Math.min(44,site.logoSize*.6))}}>{site.name||'Your portfolio'}</span>;
}
