import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingFooter, MarketingHeader } from '@/components/MarketingChrome';
import { helpArticles } from '@/content/help';

type Props = { params: Promise<{ slug: string }> };
function articleFor(slug: string) {
  const article = helpArticles.find(entry => entry.slug === slug);
  if (!article) notFound();
  return article;
}

export const generateStaticParams = () => helpArticles.map(({ slug }) => ({ slug }));
export async function generateMetadata({ params }: Props) {
  return { title: articleFor((await params).slug).title + ' | Fresnel Studios' };
}

export default async function HelpArticle({ params }: Props) {
  const article = articleFor((await params).slug);
  return <div className="marketing"><MarketingHeader />
    <main className="mk-section mk-information fresnel-help">
      <Link href="/help">← Help centre</Link>
      <h1>{article.title}</h1><p>{article.summary}</p>
      <ol className="help-steps">{article.steps.map(([heading, text]) => <li key={heading}><h2>{heading}</h2><p>{text}</p></li>)}</ol>
      <h2>Related guides</h2>
      <ul>{article.related.map(slug => <li key={slug}><Link href={'/help/' + slug}>{articleFor(slug).title}</Link></li>)}</ul>
    </main><MarketingFooter />
  </div>;
}
