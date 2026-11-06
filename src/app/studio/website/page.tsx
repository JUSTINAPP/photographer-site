import { redirect } from 'next/navigation';
import { canEditWebsite, isStudioAdmin } from '@/lib/studio-access';
import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import WebsiteBuilder from '@/components/WebsiteBuilder';
import { requireStudio } from '@/lib/supabase';
import { normaliseWebsite } from '@/lib/website';

export default async function WebsiteSettings({ searchParams }: { searchParams: Promise<{ panel?: string }> }) {
  const { db, user, workspace, role } = await requireStudio();
  if (role === 'social') redirect('/studio/social');
  const { panel } = await searchParams;
  const [site, projects, media] = await Promise.all([
    db.from('studio_websites').select('draft, published, public_id').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url,published').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
    db.from('studio_media').select('id,name,source_url,kind,website_selected').eq('workspace_id', workspace.id).order('website_selected', { ascending: false }).order('created_at', { ascending: false }),
  ]);
  return (
    <StudioShell active="Website" email={user.email}>
      <div className="studio-page-heading"><div><h1>Website editor</h1><p>Edit your homepage, images and campaign order with a live preview.</p></div><div className="settings-links"><Link className="secondary-button" href="/studio/website/preview" target="_blank" rel="noopener noreferrer">Preview saved draft ↗</Link>{isStudioAdmin(role) && <Link className="secondary-button" href="/studio/settings">Settings</Link>}</div></div>
      {site.error || projects.error || media.error
        ? <p role="alert">The website builder could not load. Please try again later.</p>
        : <WebsiteBuilder initialPanel={panel === 'design' ? 'design' : 'pages'} studioId={workspace.id} readOnly={!canEditWebsite(role)} initial={normaliseWebsite(site.data?.draft)} projects={projects.data ?? []} media={media.data ?? []} publicId={site.data?.public_id} isPublished={!!site.data?.published} />}
    </StudioShell>
  );
}
