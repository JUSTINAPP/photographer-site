import {draftMotionPreview} from '@/lib/draft-motion-preview';
import GalleryWebsite from '@/components/GalleryWebsite';
import Link from 'next/link';
import { CornerUpLeft } from 'lucide-react';
import StudioNavLoading from '@/components/StudioNavLoading';
import { redirect } from 'next/navigation';
import CampaignWebsite from '@/components/CampaignWebsite';
import EditorialWebsite from '@/components/EditorialWebsite';
import { requireStudio } from '@/lib/supabase';
import { homepageWork, normaliseWebsite, preloadWebsiteDraft } from '@/lib/website';

export const dynamic='force-dynamic';
export const revalidate=0;

export const metadata = { title: 'Private website preview | Fresnel Studios', robots: { index: false, follow: false } };

export default async function DraftPreview({ searchParams }: { searchParams: Promise<{ about?: string; campaign?: string;studio?:string;revision?:string }> }) {
  const { db, workspace, role } = await requireStudio();
  if (role === 'social') redirect('/studio/social');
  const view=await searchParams;
  if(view.studio&&view.studio!==workspace.id)throw new Error('The active studio changed. Return to the editor and select the correct studio before previewing.');
  const [website, projects, media] = await Promise.all([
    db.from('studio_websites').select('draft').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url,published').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
    db.from('studio_media').select('id,name,source_url,kind,website_selected').eq('workspace_id', workspace.id).order('created_at').order('id'),
  ]);
  if (website.error || projects.error || media.error) throw new Error('The draft preview could not load.');
  let site = preloadWebsiteDraft(normaliseWebsite(website.data?.draft), media.data ?? []);
  const motionPreview=await draftMotionPreview(db,workspace.id,site.motion);
  if(motionPreview)site={...site,motion:{...site.motion,desktopUrl:motionPreview.desktop,mobileUrl:motionPreview.mobile}};

  const work = homepageWork(site, projects.data ?? []);
  const previewProject = projects.data?.find(project => project.id === view.campaign);
  return <main>
    <div className="private-preview-bar"><span>Private draft preview · Your saved edits · Not the live website</span><Link href={'/studio/website?panel=pages' + (view.campaign ? '&page=' + encodeURIComponent(view.campaign) : view.about ? '&page=about' : '')}><CornerUpLeft size={16} aria-hidden="true" /> Back to editor <StudioNavLoading /></Link></div>
    {site.theme.layout === 'gallery' ? <GalleryWebsite site={site} projects={work} allProjects={projects.data ?? []} base="/studio/website/preview" view={view}/> : site.theme.layout === 'campaign' || previewProject || view.about ? <CampaignWebsite site={site} projects={work} allProjects={projects.data ?? []} base="/studio/website/preview" view={view} previewProject={previewProject} />
      : <EditorialWebsite site={site} projects={work} allProjects={projects.data ?? []} base="/studio/website/preview" />}
  </main>;
}
