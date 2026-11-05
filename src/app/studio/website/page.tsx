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
      <div className="studio-page-heading"><div><p className="eyebrow">Your portfolio</p><h1>Website builder</h1><p>Build your portfolio with the Editorial starting preset, then preview and publish it.</p></div></div>
      {site.error || projects.error
        ? <p role="alert">The website builder could not load. Please try again later.</p>
        : <WebsiteBuilder initial={normaliseWebsite(site.data?.draft)} projects={projects.data ?? []} publicId={site.data?.public_id} isPublished={!!site.data?.published} />}
    </StudioShell>
  );
}
