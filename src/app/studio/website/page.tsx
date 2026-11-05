import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import WebsiteBuilder from '@/components/WebsiteBuilder';
import { requireStudio } from '@/lib/supabase';
import { normaliseWebsite } from '@/lib/website';

export default async function WebsiteSettings() {
  const { db, user, workspace, role } = await requireStudio();
  const [site, projects, media] = await Promise.all([
    db.from('studio_websites').select('draft, published, public_id').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url').eq('workspace_id', workspace.id).eq('published', true).order('created_at', { ascending: false }),
    db.from('studio_media').select('id,name,source_url,kind,website_selected').eq('workspace_id', workspace.id).order('website_selected', { ascending: false }).order('created_at', { ascending: false }),
  ]);
  return (
    <StudioShell active="Website" email={user.email}>
      <div className="studio-page-heading"><div><h1>Website design</h1><p>Choose a photographer template, then adjust typography, colours and layout. Preview changes before saving.</p></div>{role === 'owner' && <Link className="secondary-button" href="/studio/settings">Settings</Link>}</div>
      {site.error || projects.error || media.error
        ? <p role="alert">The website builder could not load. Please try again later.</p>
        : <WebsiteBuilder studioId={workspace.id} readOnly={role === 'viewer'} initial={normaliseWebsite(site.data?.draft)} projects={projects.data ?? []} media={media.data ?? []} publicId={site.data?.public_id} isPublished={!!site.data?.published} />}
    </StudioShell>
  );
}
