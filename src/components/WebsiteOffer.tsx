import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { publicPrices } from '@/lib/platform-pricing';
import { ActionLink } from './ActionFeedback';
export default async function WebsiteOffer() {
  const prices = await publicPrices();
  const price = prices.find(plan => plan.id === 'independent')!;
  return <section className="fh-pricing" id="pricing">
    <div><p className="fh-eyebrow">A SIMPLE START</p><h2>Distinctive by design.<br/>Simple by choice.</h2><p>Everything you need to give your photography its own space.</p><Link href="/pricing" className="fh-link">View all plans <ArrowUpRight size={16}/></Link></div>
    <div className="fh-price"><p className="fh-eyebrow">WEBSITE / PROPOSED LAUNCH PRICE</p><p className="fh-price-amount"><span>A$</span>{price.annual}<small>/ month</small></p><p>A${price.annual * 12} billed annually, or A${price.monthly} month-to-month.</p><ul><li>Stills, motion and campaign galleries</li><li>Your own logo, type and layouts</li><li>Private drafts and website import</li></ul><ActionLink href="/signup/start" className="fh-button">Start building <ArrowUpRight size={17}/></ActionLink><small className="fh-price-note">Proposed pricing. No payments taken yet. Storage, video allowances and tax treatment will be confirmed before launch.</small></div>
  </section>;
}
