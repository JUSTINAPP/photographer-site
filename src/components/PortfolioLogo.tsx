import type { Website } from '@/lib/website';

export default function PortfolioLogo({ site }: { site: Website }) {
  return site.logo ? <img className="portfolio-logo" src={site.logo} alt={site.name || 'Portfolio'}
    style={{ height: site.logoSize }} /> : site.name || 'Your portfolio';
}
