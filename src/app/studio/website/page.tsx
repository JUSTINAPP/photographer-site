import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import WebsiteBuilder from '@/components/WebsiteBuilder';
import { requireStudio } from '@/lib/supabase';
import { normaliseWebsite } from '@/lib/website';

export default async function WebsiteSettings() {
  const { db, user, workspace } = await requireStudio();
  const [site, projects] = await Promise.all([
    db.from('studio_websites').select('draft, published, public_id').eq('workspace_id', workspace.id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url').eq('workspace_id', workspace.id).eq('published', true).order('created_at', { ascending: false }),
  ]);
  return (
    <StudioShell active="Website" email={user.email}>
      <div className="studio-page-heading"><div><h1>Website design</h1><p>Choose a photographer template, then adjust typography, colours and layout. Preview changes before saving.</p></div><Link className="secondary-button" href="/studio/settings">Settings</Link></div>
      {site.error || projects.error
        ? <p role="alert">The website builder could not load. Please try again later.</p>
        : <WebsiteBuilder initial={normaliseWebsite(site.data?.draft)} projects={projects.data ?? []} publicId={site.data?.public_id} isPublished={!!site.data?.published} />}
    </StudioShell>
  );
}
