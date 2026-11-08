'use client';

import { useActionState, useState } from 'react';
import { SubmitButton } from './ActionFeedback';
import TeamAccessSelect from './TeamAccessSelect';
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

export default function StudioTeamSettings({ id, owner, email, members, error }: {
  id: string; owner: boolean; email?: string; members: Member[]; error: boolean;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [status, action, pendingAction] = useActionState(async (previous: string, form: FormData) => {
    const result = await manageTeam(id, previous, form);
    if (result === 'invited') setInviteEmail('');
    return result;
  }, '');
  const options = Object.entries(teamRoles).filter(([role]) => owner || role !== 'admin');
  function memberRow(member: Member) {
    return <form className="studio-team-member settings-team-row" action={action} key={member.email}>
      <fieldset disabled={pendingAction} className="settings-team-fields">
      <input type="hidden" name="email" value={member.email} />
      <strong>{member.email}{member.email === email && ' (you)'}</strong>
      {owner || member.role !== 'admin' ? <>
        <TeamAccessSelect key={member.role} initial={member.role} options={options} label={'Access for ' + member.email} />
        <SubmitButton className="secondary-button" name="intent" value="update">Save</SubmitButton>
        <SubmitButton className="settings-remove" name="intent" value="remove">{member.user_id ? 'Remove' : 'Revoke'}</SubmitButton>
      </> : <span>Admin</span>}
      </fieldset>
    </form>;
  }
  const pending = members.filter(member => !member.user_id);
  return <section id="team" className="studio-panel studio-setting-form settings-team">
    <h2>Team</h2><p>Manage the people who can work in this studio.</p>

    {error && <p role="alert">Could not load the team.</p>}
    <h3>People with access</h3>
    {owner && <p>{email} (you) · Owner</p>}
    {members.filter(member => member.user_id).map(memberRow)}
    <h3>Pending invitations</h3>
    {pending.length ? pending.map(memberRow) : <p>No pending invitations.</p>}
    <form action={action}>
      <fieldset className="settings-team-invite settings-team-fields" disabled={pendingAction}>
        <label>Email<input type="email" name="email" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} placeholder="colleague@studio.com" required maxLength={254} /></label>
        <div className="team-access-field"><span>Access</span><TeamAccessSelect key={status === 'invited' ? 'invited' : 'new'} label="Access" initial="assistant" options={options} /></div>
        <SubmitButton className="primary-button" name="intent" value="invite">Create invitation</SubmitButton>
      </fieldset>
    </form>
    <div className="settings-team-feedback" role="status" aria-live="polite">
      {!pendingAction && Object.hasOwn(messages, status) && messages[status]}
    </div>
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
