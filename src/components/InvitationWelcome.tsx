'use client';
import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { openInvitedStudio } from '@/app/auth/welcome/actions';
import { ActionSpinner } from './ActionFeedback';

export default function InvitationWelcome() {
  const started = useRef(false);
  const [message, setMessage] = useState('Verifying your invitation…');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    async function finish() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const access_token = fragment.get('access_token');
      const refresh_token = fragment.get('refresh_token');
      window.history.replaceState(null, '', window.location.pathname);
      if (!access_token || !refresh_token) { setMessage('This link is incomplete or expired. Request another invitation, or sign in with your password below.'); return; }
      const db = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { error } = await db.auth.setSession({ access_token, refresh_token });
      if (error) { setMessage('This invitation has expired. Request another invitation or sign in with your password.'); return; }
      const result = await openInvitedStudio();
      if (result) setMessage(result.message);
    }
    void finish().catch(() => setMessage('We could not finish opening this invitation. Try the latest email again or sign in below.'));
  }, []);
  return <p role="status"><ActionSpinner /> {message}</p>;
}
