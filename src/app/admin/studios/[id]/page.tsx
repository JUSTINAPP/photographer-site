import { notFound } from 'next/navigation';
import { platformStudios } from '@/lib/platform-admin';
import { platformDate } from '@/lib/platform-types';
import { StudioAccountForm, SupportForm, OpenBackendButton } from '@/components/admin/StudioAdminForms';
import InviteStudioLink from '@/components/admin/InviteStudioLink';
import { ActionLink } from '@/components/ActionFeedback';

export default async function AdminStudio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const studio = (await platformStudios()).find(item => item.id === id);
  if (!studio) notFound();
  return <>
    <ActionLink href="/admin">← All studios</ActionLink>
    <div className="studio-page-heading"><div><h1>{studio.name}</h1><p>{studio.email} · {studio.claimed ? 'Account claimed' : 'Prepared studio · awaiting photographer'}</p></div><OpenBackendButton studio={id} /></div>
    <div className="admin-stats">
      <div className="studio-panel"><p>Media</p><strong>{studio.media_count}</strong></div>
      <div className="studio-panel"><p>Campaigns</p><strong>{studio.project_count}</strong></div>
      <div className="studio-panel"><p>Website</p><strong>{studio.live ? 'Live' : 'Draft'}</strong></div>
      <div className="studio-panel"><p>Joined</p><strong className="admin-date">{platformDate(studio.created_at)}</strong></div>
    </div>
    <section className="studio-panel"><h2>Help set up this studio</h2><p>Use Open backend above for immediate access to this studio for one hour. You can manage media, campaigns and website pages. For a longer session, choose a duration below. Your access is recorded in Admin support activity.</p>{studio.website && <p>Current website <a href={studio.website} target="_blank" rel="noreferrer">{studio.website}</a></p>}<SupportForm studio={id} /></section>
    <section className="studio-panel"><h2>{studio.claimed ? 'Photographer access' : 'Invite the photographer'}</h2>
      {studio.claimed ? <p>This photographer has claimed their account. They can sign in at <a href="/login">fresnelstudio.com/login</a>.</p> : <InviteStudioLink id={id} email={studio.email} />}
    </section>
    <section className="studio-panel"><h2>Plan and account notes</h2><p>Record the agreed plan, trial and onboarding notes here. Payments are managed separately while Fresnel pricing is being prepared for launch.</p><StudioAccountForm studio={studio} /></section>
  </>;
}
