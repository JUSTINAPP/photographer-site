import type { ReactNode } from 'react';
import { MarketingFooter, MarketingHeader } from '@/components/MarketingChrome';
import './help.css';

export default function HelpLayout({ children }: { children: ReactNode }) {
  return <div className="fresnel-help">
    <MarketingHeader />
    {children}
    <MarketingFooter />
  </div>;
}
