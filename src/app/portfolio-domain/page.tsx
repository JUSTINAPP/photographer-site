import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import CampaignWebsite from '@/components/CampaignWebsite';
import EditorialWebsite from '@/components/EditorialWebsite';
import { configured, database } from '@/lib/supabase';
import { portfolioDomainTokens, portfolioHostname } from '@/lib/studio-domain';
import { homepageWork, normaliseWebsite, publishedWebsiteWork, type WebsiteProject } from '@/lib/website';

export default async function DomainPortfolio({ searchParams }: { searchParams: Promise<{ about?: string; campaign?: string }> }) {
  const host = portfolioHostname((await headers()).get('host') || '');
  if (!configured() || !host) notFound();
  const db = await database();
  const { data: candidates } = await db.rpc('published_domain_candidates', { domain_name: host });
  if (!candidates?.length) notFound();
  const tokens = await portfolioDomainTokens(host);
  const matches = candidates.filter((candidate: { verification_token: string }) => tokens.includes('fresnel=' + candidate.verification_token));
  if (matches.length !== 1) notFound();
  const { data } = await db.rpc('published_studio_website', { site_id: matches[0].public_id }).maybeSingle();
  const result = data as { settings: unknown; projects: WebsiteProject[] } | null;
  if (!result) notFound();
  const site = normaliseWebsite(result.settings);
  const projects = publishedWebsiteWork(result.settings, result.projects);
  const work = homepageWork(site, projects);
  const view = await searchParams;
  if (site.theme.layout === 'campaign' || view.campaign || view.about) {
    if (view.campaign && !projects.some(project => project.id === view.campaign)) notFound();
    return <main><CampaignWebsite site={site} projects={work} allProjects={projects} base="/" view={view} /></main>;
  }
  return <main><EditorialWebsite site={site} projects={work} allProjects={projects} base="/" /></main>;
}
