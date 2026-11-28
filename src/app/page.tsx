import SmartImage from '@/components/SmartImage';
import { ActionLink } from '@/components/ActionFeedback';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingChrome';
import WebsiteOffer from '@/components/WebsiteOffer';

export const metadata = {
  title: 'Distinctive photography websites — Fresnel Studios',
  description: 'A distinctive website for your photography. Show stills, motion and complete campaigns. Make it your own with Fresnel.'
};

export default function Home() {
  return <div className="marketing fresnel-home">
    <MarketingHeader overlay/>
    <main>
      <section className="fh-hero">
        <SmartImage priority variant="hero" src="/images/fashion.jpg" alt="Black and white fashion portrait, an original AI concept"/>
        <div className="fh-hero-content"><p className="fh-eyebrow">WEBSITES FOR PHOTOGRAPHERS</p><h1>Your work.<br/><em>Distinctly yours.</em></h1><p>A distinctive photography website.<br/>Simple to make your own.</p><div className="fh-actions"><ActionLink href="/signup" className="fh-button">Start free <ArrowUpRight size={17}/></ActionLink><Link href="/examples/rowan-vale" className="fh-link">Explore an example <ArrowUpRight size={16}/></Link></div></div>
        <span className="fh-image-note">Original AI concept imagery</span><a href="#website-tools" className="fh-scroll" aria-label="Explore website features">Explore ↓</a>
      </section>

      <section className="fh-intro" id="website-tools"><p className="fh-eyebrow">MADE FOR YOUR POINT OF VIEW</p><h2>A website that gives<br/>the work <em>room to breathe.</em></h2><div className="fh-benefits">
        <article><span>01</span><h3>Let the images lead.</h3><p>Full-screen stills, motion openings and campaign galleries. From the first frame to the full story.</p></article>
        <article><span>02</span><h3>Make it feel like you.</h3><p>Your name, your typography, your rhythm. Shape the page and see your changes as you edit.</p></article>
        <article><span>03</span><h3>Publish when you’re ready.</h3><p>Bring your existing work. Refine it in a private draft, then share it with the world.</p></article>
      </div></section>

      <section className="fh-showcase"><SmartImage variant="hero" src="/images/sailing.jpg" alt="Sailing yacht in dramatic light, an original AI concept"/><div><p className="fh-eyebrow">STILLS. MOTION. YOUR OWN PERSPECTIVE.</p><h2>Built around<br/><em>the way you see.</em></h2><Link href="/examples/rowan-vale" className="fh-link">Explore the example portfolio <ArrowUpRight size={17}/></Link></div><span className="fh-image-note">Rowan Vale / Concept portfolio</span></section>

      <section className="fh-migration"><div className="fh-migration-image"><SmartImage src="/images/lifestyle.jpg" alt="Summer lifestyle photography, an original AI concept"/></div><div className="fh-migration-copy"><p className="fh-eyebrow">BRING YOUR WORK WITH YOU</p><h2>A new home.<br/><em>A familiar body of work.</em></h2><p>Start with your existing website. Review your images and campaigns, reuse what you’ve imported and make the next version your own.</p><Link href="/demo?view=Import%20website" className="fh-link">Explore website import <ArrowUpRight size={17}/></Link></div></section>

      <WebsiteOffer/>

      <section className="fh-extras"><p className="fh-eyebrow">A LITTLE MORE BEHIND THE SCENES</p><h2>Your website first.<br/><em>A studio behind it.</em></h2><p>Contacts, reference boards and proposal drafts. Useful extras for the work around your photography.</p><Link href="/demo" className="fh-link">Explore the studio tools <ArrowUpRight size={17}/></Link></section>

      <section className="fh-faq" id="faq"><h2>A few things<br/><em>to know.</em></h2><div>{[
        {q:'Can I bring my existing website?',a:'Yes. Start with your public website URL and review what Fresnel finds. For supported sites, organise imported campaigns using images already in Media. Review everything in a private draft before publishing; source layouts and embedded video players may need adjustment.'},
        {q:'Can I show both photography and video?',a:'Yes. Combine photographs, video openings and campaign galleries. You can also create a short silent opening from selected photographs or clips, save the edit to Media and use it on a page.'},
        {q:'What can I use today?',a:'Create an account to build your website, edit pages, customise your logo and typography, and preview private drafts. Studio tools include contacts, reference boards and proposal drafts. Subscriptions are not active yet; live social publishing, payments and client delivery are planned.'}
      ].map(item=><details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></section>
      <section className="fh-final"><h2>Make it <em>yours.</em></h2><ActionLink href="/signup" className="fh-button">Start your website <ArrowUpRight size={18}/></ActionLink></section>
    </main>
    <MarketingFooter/>
  </div>;
}
