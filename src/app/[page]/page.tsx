import {database,configured} from '@/lib/supabase';
import {renderPublishedWebsite} from '@/components/PublishedWebsite';
import {validPublishedSlug} from '@/lib/published-address';
import {cache} from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingChrome';
import { contactEmail, informationPages, legalLinks } from '@/content/site-information';

// Portfolio names are resolved at request time; unknown paths must not use static-page fallback.
export const dynamic='force-dynamic';

type Props = { params: Promise<{ page: string }>;searchParams:Promise<{about?:string;campaign?:string}> };
const portfolio=cache(async(slug:string)=>{if(!configured()||!validPublishedSlug(slug))return null;const {data}=await (await database()).rpc('published_studio_by_slug',{site_slug:slug}).maybeSingle();return data as {public_id:string;name:string}|null;});

function getPage(key: string) {
  if (!Object.hasOwn(informationPages, key)) notFound();
  return informationPages[key as keyof typeof informationPages];
}

export function generateStaticParams() {
  return Object.keys(informationPages).map(page => ({ page }));
}

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  if(Object.hasOwn(informationPages,page))return { title: `${getPage(page).title} | Fresnel Studios` };
  const site=await portfolio(page);return {title:site?.name||'Portfolio'};
}

export default async function InformationPage({ params,searchParams }: Props) {
  const { page } = await params;
  if(!Object.hasOwn(informationPages,page)){const site=await portfolio(page);if(!site)notFound();return renderPublishedWebsite(site.public_id,await searchParams,'/'+page);}
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
