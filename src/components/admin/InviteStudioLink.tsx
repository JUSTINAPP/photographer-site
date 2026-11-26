'use client';

import '@/components/portfolio-builder.css';
import { useActionState, useState } from 'react';
import { sendPhotographerInvitation } from '@/app/admin/actions';
import { SubmitButton } from '@/components/ActionFeedback';

export default function InviteStudioLink({ id, email, name, claimed = false }: { id: string; email: string; name?: string; claimed?: boolean }) {
  const [message, setMessage] = useState('');
  const [state, action, pending] = useActionState(sendPhotographerInvitation.bind(null, id), { message: '', sent: false });
  const path = '/join/' + id;
  return <div className="photographer-invitation">
    <div className="settings-owner-details"><strong>{name || 'Photographer'}</strong><span>{email}</span><span>Studio owner · full admin access</span><span>{claimed ? 'Account activated' : 'Awaiting photographer activation'}</span></div>
    <p>{claimed ? 'Send a secure access email if the photographer needs help returning to their studio.' : 'Their details were saved when you prepared this studio. They will verify their email, choose a password and open the website and work you have already prepared.'}</p>
    <form action={action}><SubmitButton className="primary-button" disabled={pending || state.sent}>{state.sent ? 'Invitation email sent' : claimed ? 'Email studio access link' : 'Send invitation email'}</SubmitButton></form>
    <p role="status" aria-live="polite">{state.message}</p>
    <p>After setup, they return using their email and password. Your Fresnel support access stays separate from their account.</p>
    <details><summary>Share an invitation link instead</summary><p>Only {email} can claim this prepared studio.</p>
      <button className="secondary-button" type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(new URL(path, window.location.origin).href); setMessage('Invitation link copied.'); }
        catch { setMessage('Open the invitation link below and copy its address.'); }
      }}>Copy invitation link</button>{' '}
      <a href={path} target="_blank" rel="noreferrer">Open invitation ↗</a><p role="status">{message}</p>
    </details>
  </div>;
}
