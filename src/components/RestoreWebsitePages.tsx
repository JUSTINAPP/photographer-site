'use client';

import { ActionButton } from '@/components/ActionFeedback';

import { useState, useTransition } from 'react';
import { importPageStructure } from '@/app/studio/website/actions';
import type { WebsiteProject } from '@/lib/website';

export default function RestoreWebsitePages({ id, source, onRestore }: {
  id: string; source: string; onRestore: (home: string[], pages: { id: string; photos: string[] }[], projects: WebsiteProject[]) => void;
}) {
  const [url, setUrl] = useState(source);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  return <details className="restore-website-pages">
    <summary>Restore pages and photo order from a website</summary>
    <p>Rescan the source to match photos already in Media. This arranges matched photos in the draft and adds galleries to source pages that have no saved gallery. Review the result before saving.</p>
    <form onSubmit={event => {
      event.preventDefault();
      setMessage('');
      startTransition(async () => {
        try {
          const result = await importPageStructure(id, url.trim());
          if (result.error || !result.home || !result.pages || !result.projects) {
            setMessage(result.error || 'Could not restore pages.');
            return;
          }
          onRestore(result.home, result.pages, result.projects);
          setMessage('Matched ' + result.home.length + ' homepage photos and ' + result.pages.length + ' linked pages.' +
            (result.warningCount ? ' Some source pages could not be read.' : ' Review the draft before publishing.'));
        } catch { setMessage('Could not restore pages. Please try again.'); }
      });
    }}>
      <label>Original website<input type="text" inputMode="url" autoCapitalize="none" spellCheck={false} autoComplete="url" value={url} placeholder="www.yourwebsite.com" required onChange={event => setUrl(event.target.value)} /></label>
      <ActionButton busy={pending} className="secondary-button" disabled={pending}>{pending ? 'Scanning source…' : 'Scan and arrange photos'}</ActionButton>
      {pending && <progress className="website-publish-progress" aria-label="Scanning website" />}
      <p role="status">{message}</p>
    </form>
  </details>;
}
