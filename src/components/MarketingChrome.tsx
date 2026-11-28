import { company, informationPages, legalLinks } from '@/content/site-information';
import FresnelMark from './FresnelMark';
import Link from 'next/link';
export {default as MarketingHeader} from './MarketingHeader';
export function MarketingFooter() {
  return (
    <footer className="mk-footer mk-footer-directory">
      <div>
        <Link className="mk-logo" href="/"><FresnelMark />Fresnel Studios</Link>
        <p>Distinctive photography websites, with studio tools behind them.</p>
        <p>{company}</p>
      </div>
      <div className="mk-footer-links">
        <span>PRODUCT</span>
        <Link href="/#website-tools">Website features</Link>
        <Link href="/ai">AI and imagery</Link>
        <Link href="/mobile">Mobile access</Link>
        <Link href="/pricing">Proposed plans</Link>
        <Link href="/trust">Trust centre</Link>
        <Link href="/demo">Studio demo</Link>
        <Link href="/examples/rowan-vale">Example portfolio</Link>
      </div>
      <div className="mk-footer-links">
        <span>COMPANY</span>
        <Link href="/login">Account sign-in</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/help">Help centre</Link>
        <Link href="/support">Support and enquiries</Link>
      </div>
      <div className="mk-footer-links">
        <span>LEGAL</span>
        {legalLinks.map(key => <Link href={`/${key}`} key={key}>{informationPages[key].title}</Link>)}
      </div>
    </footer>
  );
}
