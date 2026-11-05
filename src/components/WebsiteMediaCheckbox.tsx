'use client';

import { useState, useTransition } from 'react';
import { selectWebsiteMedia } from '@/app/studio/media/actions';

export default function WebsiteMediaCheckbox({ id, selected }: { id: string; selected: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  return <div className="website-media-checkbox">
    <label><input type="checkbox" checked={selected} disabled={pending} onChange={event => {
      const next = event.currentTarget.checked;
      setError(false);
      startTransition(async () => {
        try { await selectWebsiteMedia(id, next); } catch { setError(true); }
      });
    }} /> Select for website</label>
    {pending && <small role="status">Saving selection…</small>}
    {error && <small role="alert">Could not save selection. Please try again.</small>}
  </div>;
}
