import SmartImage from './SmartImage';
import {portfolioLogoSource} from '@/lib/portfolio-logo';
import type {Website} from '@/lib/website';
export default function PortfolioLogo({site,light}:{site:Website;light?:boolean}){
 const logo=portfolioLogoSource(site,light);
 return logo?<SmartImage className="portfolio-logo" src={logo} alt={site.name||'Portfolio'} style={{height:site.logoSize}}/>:<span style={{fontSize:Math.max(14,Math.min(44,site.logoSize*.6))}}>{site.name||'Your portfolio'}</span>;
}
