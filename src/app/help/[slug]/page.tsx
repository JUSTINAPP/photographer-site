import Link from 'next/link';
import { notFound } from 'next/navigation';
import { helpArticles } from '@/content/help';

type Props = { params: Promise<{ slug: string }> };
function articleFor(slug: string) {
  const article = helpArticles.find(entry => entry.slug === slug);
  if (!article) notFound();
  return article;
}

export const generateStaticParams = () => helpArticles.map(({ slug }) => ({ slug }));
export async function generateMetadata({ params }: Props) {
  const article = articleFor((await params).slug);
  return { title: article.title + ' | Fresnel Studios', description: article.summary };
}

export default async function HelpArticle({ params }: Props) {
  const article = articleFor((await params).slug);
  return <main className="help-article-layout">
    <nav className="help-guide-nav" aria-label="Help articles">
      <Link href="/help">← Help centre</Link>
      <ul>{helpArticles.map(guide => <li key={guide.slug}>
        <Link href={'/help/' + guide.slug} aria-current={guide.slug === article.slug ? 'page' : undefined}>{guide.title}</Link>
      </li>)}</ul>
    </nav>
    <article className="help-article">
      <header className="help-intro">
        <p className="help-kicker">{article.group}</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
      </header>
      <ol className="help-article-steps">
        {article.steps.map((step, index) => <li key={step.title}>
          <span className="help-step-number" aria-hidden="true">{index + 1}</span>
          <div className="help-step-body">
            <h2>{step.title}</h2>
            {step.instructions.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {step.shot && <figure>
              <a href={'/help/' + step.shot.file} aria-label={'Open full-size screenshot for ' + step.title}>
                <img src={'/help/' + step.shot.file} width={step.shot.width} height={step.shot.height} alt={step.caption ?? ''} loading="lazy" />
              </a>
              <figcaption>{step.caption} <span>Select to enlarge.</span></figcaption>
            </figure>}
          </div>
        </li>)}
      </ol>
      <aside className="help-note"><h2>Good to know</h2><p>{article.tip}</p></aside>
      <section className="help-group">
        <h2>Related guides</h2>
        <ul className="help-guide-cards">{article.related.map(slug => {
          const related = articleFor(slug);
          return <li key={slug}><Link href={'/help/' + slug}>
            <span><strong>{related.title}</strong><span>{related.summary}</span></span>
          </Link></li>;
        })}</ul>
      </section>
    </article>
  </main>;
}
