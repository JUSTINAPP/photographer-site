import Link from 'next/link';
import { MarketingFooter, MarketingHeader } from '@/components/MarketingChrome';
import { helpArticles } from '@/content/help';
import { contactEmail } from '@/content/site-information';

export const metadata = { title: 'Help centre | Fresnel Studios' };

export default function HelpCentre() {
  return <div className="marketing"><MarketingHeader />
    <main className="mk-section mk-information fresnel-help">
      <h1>Help centre</h1>
      <p>Guides to designing your portfolio and running your studio.</p>
      <ul className="help-guide-list">{helpArticles.map(article =>
        <li key={article.slug}><Link href={'/help/' + article.slug}><strong>{article.title} ↗</strong><span>{article.summary}</span></Link></li>
      )}</ul>
      <p>Need a hand? <a href={'mailto:' + contactEmail}>{contactEmail}</a></p>
    </main><MarketingFooter />
  </div>;
}
