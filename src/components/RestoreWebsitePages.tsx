'use client';

import { ActionButton } from '@/components/ActionFeedback';

import { useState, useTransition } from 'react';
import { importPageStructure, rebuildPortfolioCollections } from '@/app/studio/website/actions';
import type { WebsiteProject } from '@/lib/website';

export default function RestoreWebsitePages({ id, source, onRestore, onRebuild }: {
  onRebuild: (result: { pages: { id: string; category: string; photos: string[]; film: string }[]; projects: WebsiteProject[]; instagram: string }) => void;
  id: string; source: string; onRestore: (home: string[], pages: { id: string; photos: string[] }[], projects: WebsiteProject[]) => void;
}) {
  const [url, setUrl] = useState(source);
  const [message, setMessage] = useState('');
  const [review, setReview] = useState<{ total: number; names: string[] } | null>(null);
  const [pending, startTransition] = useTransition();

  return <details className="restore-website-pages">
    <summary>Rebuild from my existing site</summary>
    <p>Match the original Squarespace galleries against your Media library and create a private draft organised into Portfolio, Advertising, Motion and Personal. Existing campaign galleries are kept. Review before saving the design.</p>
    <form onSubmit={event => {
      event.preventDefault();
      const rebuild = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') !== 'restore';
      setMessage('');
      setReview(null);
      if (rebuild) {
        startTransition(async () => {
          try {
            const result = await rebuildPortfolioCollections(id, url);
            if (!result.pages || !result.projects) { setMessage(result.error ?? 'The scan could not be completed.'); return; }
            onRebuild({ pages: result.pages, projects: result.projects, instagram: result.instagram });
            setReview({ total: result.unmatched, names: result.review });
            setMessage(`Prepared ${result.pages.length} galleries and films. ${result.unmatched} source items need review.` +
              (result.missing.length ? ` Sections with no readable galleries: ${result.missing.join(', ')}.` : '') +
              ' Review the preview, then save the design.');
          } catch { setMessage('Could not rebuild the draft. Please try again.'); }
        });
        return;
      }
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
      <ActionButton value="rebuild" busy={pending} className="primary-button" disabled={pending}>{pending ? 'Scanning source…' : 'Rebuild draft collections'}</ActionButton>
      {' '}<ActionButton value="restore" className="secondary-button" disabled={pending}>Restore photo order only</ActionButton>
      {pending && <progress className="website-publish-progress" aria-label="Scanning website" />}
      <p role="status">{message}</p>
    </form>
    {!!review?.total && <details>
      <summary>Needs review · {review.total} unmatched source items</summary>
      <p>These items are on the source site but could not be matched to Media. Check the filenames or import the source gallery again.</p>
      <ul>{review.names.map((name, index) => <li key={index}>{name}</li>)}</ul>
      {review.total > review.names.length && <p>Showing the first {review.names.length} items.</p>}
    </details>}
  </details>;
}
