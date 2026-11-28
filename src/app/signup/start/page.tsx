import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingChrome';
export const metadata={title:'Start your photography website — Fresnel Studios'};
export default async function Start({searchParams}:{searchParams:Promise<{method?:string}>}){
  const {method}=await searchParams;
  return <div className="marketing fh-start"><MarketingHeader/><main><p className="fh-eyebrow">YOUR PHOTOGRAPHY WEBSITE</p><h1>How would you<br/>like to start?</h1><p>Start with a fresh design or bring the work from your current website.</p><div className="fh-start-options"><a className={method!=='import'?'recommended':''} href="/signup/start/continue?method=create"><span>01 / CREATE</span><h2>Build a new website.</h2><p>Choose your design, add your photographs and make it your own in the website editor.</p><strong>Start building <ArrowUpRight size={20}/></strong></a><a className={method==='import'?'recommended':''} href="/signup/start/continue?method=import"><span>02 / IMPORT</span><h2>Bring your existing work.</h2><p>Review your public pages and images, then shape your new site in a private draft.</p><strong>Start with your website <ArrowUpRight size={20}/></strong></a></div><p className="fh-start-note">Already signed in? Go straight to your workspace. New to Fresnel? Create a free account to save your work.</p><Link className="fh-link" href="/examples/rowan-vale">Explore an example first <ArrowUpRight size={16}/></Link></main><MarketingFooter/></div>
}
