import { notFound } from 'next/navigation';
import CampaignWebsite from '@/components/CampaignWebsite';
import EditorialWebsite from '@/components/EditorialWebsite';
import { configured, database } from '@/lib/supabase';
import { normaliseWebsite, publishedWebsiteWork, type WebsiteProject } from '@/lib/website';

export default async function PublishedWebsite({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ about?: string; campaign?: string }> }) {
  const { id } = await params;
  if (!configured() || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) notFound();
  const db = await database();
  const { data } = await db.rpc('published_studio_website', { site_id: id }).maybeSingle();
  const result = data as { settings: unknown; projects: WebsiteProject[] } | null;
  if (!result) notFound();
  const site = normaliseWebsite(result.settings);
  const projects = publishedWebsiteWork(result.settings, result.projects);
  if (site.theme.layout === 'campaign') {
    const view = await searchParams;
    if (view.campaign && !projects.some(project => project.id === view.campaign)) notFound();
    return <main><CampaignWebsite site={site} projects={projects} base={'/sites/' + id} view={view} /></main>;
  }
  return <main><EditorialWebsite site={site} projects={projects} /></main>;
}
