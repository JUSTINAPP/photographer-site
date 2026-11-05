import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingChrome';
import { contactEmail, informationPages, legalLinks } from '@/content/site-information';

type Props = { params: Promise<{ page: string }> };

function getPage(key: string) {
  if (!Object.hasOwn(informationPages, key)) notFound();
  return informationPages[key as keyof typeof informationPages];
}

export function generateStaticParams() {
  return Object.keys(informationPages).map(page => ({ page }));
}

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  return { title: `${getPage(page).title} | Fresnel Studios` };
}

export default async function InformationPage({ params }: Props) {
  const { page } = await params;
  const { title, summary, sections } = getPage(page);
  return (
    <div className="marketing">
      <MarketingHeader />
      <main className="mk-section mk-information">
        <h1>{title}</h1>
        <p>{summary}</p>
        {sections.map(([heading, ...paragraphs]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            {paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <p><a href={`mailto:${contactEmail}?subject=Fresnel%20Studios`}>{contactEmail}</a></p>
        {page === 'trust' && (
          <ul>{legalLinks.map(key => <li key={key}><Link href={`/${key}`}>{informationPages[key].title}</Link></li>)}</ul>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
