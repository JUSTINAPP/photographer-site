import { notFound } from 'next/navigation';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import ProspectForm from '@/components/admin/ProspectForm';
import { PrepareStudioForm } from '@/components/admin/StudioAdminForms';
import { ActionLink } from '@/components/ActionFeedback';

export default async function ProspectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { db } = await requirePlatformAdmin();
  const { id } = await params;
  const { data: prospect, error } = await db.from('platform_prospects').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('The prospect could not be loaded.');
  if (!prospect) notFound();
  return <>
    <ActionLink href="/admin/prospects">← All prospects</ActionLink>
    <div className="studio-page-heading"><div><h1>{prospect.name}</h1><p>Contact history, follow-up and onboarding.</p></div></div>
    <section className="studio-panel"><ProspectForm prospect={prospect} /></section>
    <section className="studio-panel"><h2>Prepare their studio</h2>{prospect.workspace_id && <p><ActionLink href={'/admin/studios/' + prospect.workspace_id}>Open linked studio →</ActionLink></p>}<p>Use this photographer’s email to prepare a private studio or find the one they already created. Then import their portfolio and share the invitation.</p><PrepareStudioForm prospect={prospect.id} name={prospect.name} email={prospect.email} website={prospect.website} /></section>
  </>;
}
