import {draftMotionPreview} from '@/lib/draft-motion-preview';
import { ActionLink } from '@/components/ActionFeedback';
import { redirect } from 'next/navigation';
import { canEditWebsite, isStudioAdmin } from '@/lib/studio-access';
import StudioShell from '@/components/StudioShell';
import WebsiteBuilder from '@/components/WebsiteBuilder';
import { requireStudio } from '@/lib/supabase';
import { normaliseWebsite, preloadWebsiteDraft } from '@/lib/website';

export const maxDuration = 60;

export default async function WebsiteSettings({ searchParams }: { searchParams: Promise<{ panel?: string; page?: string }> }) {
  const { db, user, workspace, role } = await requireStudio();
  if (role === 'social') redirect('/studio/social');
  const { panel, page } = await searchParams;
  const [site, projects, media] = await Promise.all([
    db.from('studio_websites').select('draft, published, public_id').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url,published').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
    db.from('studio_media').select('id,name,source_url,kind,website_selected').eq('workspace_id', workspace.id).order('created_at').order('id'),
  ]);
  const draft=preloadWebsiteDraft(normaliseWebsite(site.data?.draft),media.data??[]);
  const motionPreview=await draftMotionPreview(db,workspace.id,draft.motion);
  return (
    <StudioShell active="Website" email={user.email}>
      <div className="studio-page-heading"><div><h1>Website editor</h1><p>Build with your AI design partner, or use the controls. Review every change in the live preview.</p></div><div className="settings-links">{isStudioAdmin(role) && <ActionLink className="secondary-button" href="/studio/settings">Settings</ActionLink>}</div></div>
      {site.error || projects.error || media.error
        ? <p role="alert">The website builder could not load. Please try again later.</p>
        : <WebsiteBuilder initialPage={page} initialPanel={panel === 'pages' ? 'pages' : 'design'} studioId={workspace.id} readOnly={!canEditWebsite(role)} initial={draft} publishedInitial={site.data?.published?normaliseWebsite(site.data.published):undefined} initialMotionPreview={motionPreview} projects={projects.data ?? []} media={media.data ?? []} publicId={site.data?.public_id} isPublished={!!site.data?.published} />}
    </StudioShell>
  );
}
