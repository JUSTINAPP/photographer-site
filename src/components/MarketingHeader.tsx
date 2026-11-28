'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { ActionLink } from './ActionFeedback';
import FresnelMark from './FresnelMark';

export default function MarketingHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  return <header className={`mk-header mk-header-modern${overlay ? ' mk-header-overlay' : ''}${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
    <Link className="mk-logo" href="/" aria-label="Fresnel Studios home"><FresnelMark />Fresnel Studios</Link>
    <nav id="marketing-navigation" aria-label="Main navigation" onClick={() => setOpen(false)}>
      <Link href="/#website-tools">Websites</Link><Link href="/examples/rowan-vale">Explore an example <ArrowUpRight size={13}/></Link><Link href="/pricing">Pricing</Link><Link href="/login">Sign in</Link>
      <ActionLink href="/signup" className="mk-nav-cta">Start free <ArrowUpRight size={14}/></ActionLink>
    </nav>
    <button className="mk-menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="marketing-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
  </header>;
}
