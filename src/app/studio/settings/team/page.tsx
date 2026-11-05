import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import { requireStudioAccess } from '@/lib/supabase';
import { manageTeam } from './actions';

const messages: Record<string, string> = {
  invited: 'Invitation saved. Share the sign-up link with your teammate and ask them to use the invited email address.',
  updated: 'Access updated.',
  removed: 'Access removed.',
  invalid: 'Enter a valid teammate email and choose an access level.',
  exists: 'This person is already on the team or has a pending invitation.',
  changed: 'The active studio changed. Review the team and try again.',
  error: 'The team could not be updated. Please try again.',
};

function AccessSelect({ role = 'editor' }: { role?: string }) {
  return <label>Access<select name="role" defaultValue={role}><option value="editor">Website editor</option><option value="viewer">Website viewer</option></select></label>;
}

export default async function Team({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { db, workspace, user } = await requireStudioAccess('owner');
  const { data, error } = await db.from('studio_team').select('email,role,user_id').eq('workspace_id', workspace.id).order('created_at');
  const { status } = await searchParams;
  return <StudioShell active="Team" email={user.email}>
    <div className="studio-page-heading"><div><h1>Team</h1><p>Invite collaborators to this studio’s portfolio.</p></div><Link className="secondary-button" href="/studio/settings">Settings</Link></div>
    {status && Object.hasOwn(messages, status) && <p role="status">{messages[status]}</p>}
    <form action={manageTeam.bind(null, workspace.id)} className="studio-panel studio-setting-form">
      <h2>Invite a teammate</h2>
      <p>Website editors can edit and publish the portfolio, manage projects and use the media library. Website viewers can review the draft and projects. Business tools and team settings are available to the owner.</p>
      <label>Email<input type="email" name="email" required maxLength={254} /></label>
      <AccessSelect />
      <button className="primary-button" name="intent" value="invite">Create invitation</button>
      <p>Share <Link href="/signup">fresnelstudio.com/signup</Link> with new teammates. Existing users can <Link href="/login">sign in</Link> with the invited email.</p>
    </form>
    <section className="studio-panel studio-setting-form">
      <h2>People with access</h2>
      <p>{user.email} · Owner</p>
      {error && <p role="alert">Could not load the team.</p>}
      {data?.map(member => <form className="studio-team-member" action={manageTeam.bind(null, workspace.id)} key={member.email}>
        <input type="hidden" name="email" value={member.email} />
        <strong>{member.email}</strong><p>{member.user_id ? 'Active' : 'Pending invitation'}</p>
        <AccessSelect role={member.role} />
        <button className="secondary-button" name="intent" value="update">Save access</button>{' '}
        <button className="secondary-button" name="intent" value="remove">{member.user_id ? 'Remove access' : 'Revoke invitation'}</button>
      </form>)}
    </section>
  </StudioShell>;
}
