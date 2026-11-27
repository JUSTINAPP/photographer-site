import SmartImage from './SmartImage';
import {portfolioLogoSource,portfolioWordmark} from '@/lib/portfolio-logo';
import type {Website} from '@/lib/website';
export default function PortfolioLogo({site,light}:{site:Website;light?:boolean}){
 const logo=portfolioLogoSource(site,light);const wordmark=portfolioWordmark(site);
 return logo?<SmartImage className="portfolio-logo" src={logo} alt={site.name||'Portfolio'} style={{height:site.logoSize}}/>:<span className="portfolio-wordmark" style={{fontFamily:wordmark.font,fontWeight:400,fontStyle:'normal',textTransform:'none',letterSpacing:wordmark.spacing+'em',fontSize:Math.max(14,Math.min(44,site.logoSize*.6)),lineHeight:1.25,display:'inline-block',maxWidth:'100%',overflowWrap:'anywhere'}}>{wordmark.text}</span>;
}
