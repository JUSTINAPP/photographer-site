'use client';

import { useState } from 'react';

export default function InviteStudioLink({ id, email }: { id: string; email: string }) {
  const [message, setMessage] = useState('');
  const path = '/join/' + id;
  return <div>
    <p>Share this link with <strong>{email}</strong>. They sign in with that email and receive ownership of the prepared studio.</p>
    <button className="secondary-button" onClick={async () => {
      try { await navigator.clipboard.writeText(new URL(path, window.location.origin).href); setMessage('Invitation link copied. Share it with the photographer.'); }
      catch { setMessage('Open the invitation link below and copy its address.'); }
    }}>Copy invitation link</button>{' '}
    <a href={path} target="_blank" rel="noreferrer">Open invitation ↗</a>
    <p role="status">{message}</p>
  </div>;
}
