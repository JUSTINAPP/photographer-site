import Link from 'next/link';
import { manageTeam } from '@/app/studio/settings/team/actions';
import { teamRoles } from '@/lib/studio-access';

const messages: Record<string, string> = {
  invited: 'Invitation created. Share the sign-up link below with your teammate.',
  updated: 'Access updated.',
  removed: 'Access removed.',
  invalid: 'Enter a valid teammate email and choose an available access level.',
  exists: 'This person is already on the team or has a pending invitation.',
  changed: 'The active studio changed. Review the team and try again.',
  error: 'The team could not be updated. Please try again.',
};

type Member = { email: string; role: string; user_id: string | null };

export default function StudioTeamSettings({ id, owner, email, members, status, error }: {
  id: string; owner: boolean; email?: string; members: Member[]; status?: string; error: boolean;
}) {
  const action = manageTeam.bind(null, id);
  const options = Object.entries(teamRoles).filter(([role]) => owner || role !== 'admin');
  function memberRow(member: Member) {
    return <form className="studio-team-member settings-team-row" action={action} key={member.email}>
      <input type="hidden" name="email" value={member.email} />
      <strong>{member.email}{member.email === email && ' (you)'}</strong>
      {owner || member.role !== 'admin' ? <>
        <select name="role" defaultValue={member.role} aria-label={'Access for ' + member.email}>
          {options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        <button className="secondary-button" name="intent" value="update">Save</button>
        <button className="settings-remove" name="intent" value="remove">{member.user_id ? 'Remove' : 'Revoke'}</button>
      </> : <span>Admin</span>}
    </form>;
  }
  const pending = members.filter(member => !member.user_id);
  return <section id="team" className="studio-panel studio-setting-form settings-team">
    <h2>Team</h2><p>Manage the people who can work in this studio.</p>
    {status && Object.hasOwn(messages, status) && <p role="status">{messages[status]}</p>}
    {error && <p role="alert">Could not load the team.</p>}
    <h3>People with access</h3>
    {owner && <p>{email} (you) · Owner</p>}
    {members.filter(member => member.user_id).map(memberRow)}
    <h3>Pending invitations</h3>
    {pending.length ? pending.map(memberRow) : <p>No pending invitations.</p>}
    <form className="settings-team-invite" action={action}>
      <label>Email<input type="email" name="email" placeholder="colleague@studio.com" required maxLength={254} /></label>
      <label>Access<select name="role" defaultValue="assistant">{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button className="primary-button" name="intent" value="invite">Create invitation</button>
    </form>
    <p>Share the <Link href="/signup">signup link</Link> with new teammates. Existing accounts can <Link href="/login">sign in</Link> with the invited email address.</p>
    <details><summary>What each role can do</summary>
      <ul>
        <li><strong>Admin</strong> manages the studio, website, business tools and non-admin teammates. The owner assigns admin access.</li>
        <li><strong>Social media manager</strong> manages the social scheduler and can browse projects and media.</li>
        <li><strong>Assistant</strong> manages production calendar events and can review projects, media and website drafts.</li>
        <li><strong>Website editor</strong> edits and publishes the portfolio and manages projects and media.</li>
        <li><strong>Website viewer</strong> reviews the website draft, projects and media.</li>
      </ul>
    </details>
  </section>;
}
