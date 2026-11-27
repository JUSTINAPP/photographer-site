import GalleryWebsite from '@/components/GalleryWebsite';
import { notFound } from 'next/navigation';
import CampaignWebsite from '@/components/CampaignWebsite';
import EditorialWebsite from '@/components/EditorialWebsite';
import { configured, database } from '@/lib/supabase';
import { homepageWork, normaliseWebsite, publishedWebsiteWork, type WebsiteProject } from '@/lib/website';

export async function renderPublishedWebsite(id: string, view: {about?:string;campaign?:string}, base: string) {
  if (!configured() || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) notFound();
  const db = await database();
  const { data } = await db.rpc('published_studio_website', { site_id: id }).maybeSingle();
  const result = data as { settings: unknown; projects: WebsiteProject[] } | null;
  if (!result) notFound();
  const site = normaliseWebsite(result.settings);
  const projects = publishedWebsiteWork(result.settings, result.projects);
  const work = homepageWork(site, projects);
  if (site.theme.layout === 'gallery') {
    if (view.campaign && !projects.some(project => project.id === view.campaign)) notFound();
    return <main><GalleryWebsite site={site} projects={work} allProjects={projects} base={base} view={view} /></main>;
  }
  if (site.theme.layout === 'campaign' || view.campaign || view.about) {
    if (view.campaign && !projects.some(project => project.id === view.campaign)) notFound();
    return <main><CampaignWebsite site={site} projects={work} allProjects={projects} base={base} view={view} /></main>;
  }
  return <main><EditorialWebsite site={site} projects={work} allProjects={projects} base={base} /></main>;
}

