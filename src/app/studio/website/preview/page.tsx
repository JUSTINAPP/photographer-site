import Link from 'next/link';
import { redirect } from 'next/navigation';
import CampaignWebsite from '@/components/CampaignWebsite';
import EditorialWebsite from '@/components/EditorialWebsite';
import { requireStudio } from '@/lib/supabase';
import { homepageWork, normaliseWebsite } from '@/lib/website';

export const metadata = { title: 'Private website preview | Fresnel Studios', robots: { index: false, follow: false } };

export default async function DraftPreview({ searchParams }: { searchParams: Promise<{ about?: string; campaign?: string }> }) {
  const { db, workspace, role } = await requireStudio();
  if (role === 'social') redirect('/studio/social');
  const [website, projects] = await Promise.all([
    db.from('studio_websites').select('draft').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url,published').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
  ]);
  if (website.error || projects.error) throw new Error('The draft preview could not load.');
  const site = normaliseWebsite(website.data?.draft);
  const view = await searchParams;
  const work = homepageWork(site, projects.data ?? []);
  const previewProject = projects.data?.find(project => project.id === view.campaign);
  return <main>
    <div className="private-preview-bar"><span>Private preview · Last saved draft</span><Link href="/studio/website?panel=pages">Back to editor ↗</Link></div>
    {site.theme.layout === 'campaign' ? <CampaignWebsite site={site} projects={work} base="/studio/website/preview" view={view} previewProject={previewProject} />
      : <EditorialWebsite site={site} projects={work} />}
  </main>;
}
