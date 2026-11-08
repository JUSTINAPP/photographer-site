import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { helpArticles } from '@/content/help';

export const metadata = {
  title: 'Help centre | Fresnel Studios',
  description: 'Step-by-step guides to building your portfolio and running your studio in Fresnel.',
};

export default function HelpCentre() {
  const groups = [...new Set(helpArticles.map(article => article.group))];

  return <main className="help-home">
    <header className="help-intro">
      <p className="help-kicker">Fresnel Studios support</p>
      <h1>Help centre</h1>
      <p>Follow step-by-step guides with close-ups of the controls you’ll use in Fresnel.</p>
    </header>
    {groups.map(group => <section className="help-group" key={group}>
      <h2>{group}</h2>
      <ul className="help-guide-cards">{helpArticles.filter(article => article.group === group).map(article =>
        <li key={article.slug}><Link href={'/help/' + article.slug}>
          <span><strong>{article.title}</strong><span>{article.summary}</span></span>
          <ArrowRight size={19} aria-hidden="true" />
        </Link></li>
      )}</ul>
    </section>)}
    <aside className="help-note"><h2>Still need a hand?</h2><p>Tell us what you’re trying to do and where you got stuck. <Link href="/support">Contact support</Link></p></aside>
  </main>;
}
