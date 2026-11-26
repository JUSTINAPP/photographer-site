import GalleryWebsite from '@/components/GalleryWebsite';
import Link from 'next/link';
import { CornerUpLeft } from 'lucide-react';
import StudioNavLoading from '@/components/StudioNavLoading';
import { redirect } from 'next/navigation';
import CampaignWebsite from '@/components/CampaignWebsite';
import EditorialWebsite from '@/components/EditorialWebsite';
import { requireStudio } from '@/lib/supabase';
import { homepageWork, normaliseWebsite, preloadWebsiteDraft } from '@/lib/website';

export const metadata = { title: 'Private website preview | Fresnel Studios', robots: { index: false, follow: false } };

export default async function DraftPreview({ searchParams }: { searchParams: Promise<{ about?: string; campaign?: string }> }) {
  const { db, workspace, role } = await requireStudio();
  if (role === 'social') redirect('/studio/social');
  const [website, projects, media] = await Promise.all([
    db.from('studio_websites').select('draft').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url,published').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
    db.from('studio_media').select('id,name,source_url,kind,website_selected').eq('workspace_id', workspace.id).order('created_at').order('id'),
  ]);
  if (website.error || projects.error || media.error) throw new Error('The draft preview could not load.');
  let site = preloadWebsiteDraft(normaliseWebsite(website.data?.draft), media.data ?? []);
  if(site.motion.desktopPath.startsWith(workspace.id+'/motion/')){
    const [desktop,mobile]=await Promise.all([db.storage.from('studio-originals').createSignedUrl(site.motion.desktopPath,3600),db.storage.from('studio-originals').createSignedUrl(site.motion.mobilePath,3600)]);
    site={...site,motion:{...site.motion,desktopUrl:desktop.data?.signedUrl||'',mobileUrl:mobile.data?.signedUrl||''}};
  }
  const view = await searchParams;
  const work = homepageWork(site, projects.data ?? []);
  const previewProject = projects.data?.find(project => project.id === view.campaign);
  return <main>
    <div className="private-preview-bar"><span>Private preview · Last saved draft</span><Link href={'/studio/website?panel=pages' + (view.campaign ? '&page=' + encodeURIComponent(view.campaign) : view.about ? '&page=about' : '')}><CornerUpLeft size={16} aria-hidden="true" /> Back to editor <StudioNavLoading /></Link></div>
    {site.theme.layout === 'gallery' ? <GalleryWebsite site={site} projects={work} allProjects={projects.data ?? []} base="/studio/website/preview" view={view}/> : site.theme.layout === 'campaign' || previewProject || view.about ? <CampaignWebsite site={site} projects={work} allProjects={projects.data ?? []} base="/studio/website/preview" view={view} previewProject={previewProject} />
      : <EditorialWebsite site={site} projects={work} allProjects={projects.data ?? []} base="/studio/website/preview" />}
  </main>;
}
