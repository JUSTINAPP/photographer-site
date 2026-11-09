'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { ActionButton } from '@/components/ActionFeedback';
import { saveImported } from '@/app/studio/actions';
import { saveImportedMedia } from '@/app/studio/media/actions';
import { vimeoEmbed } from '@/lib/import-identity';
import type { FoundMedia } from '@/lib/import-media';
import type { ImportCandidate } from '@/lib/importer';

const exampleProjects = [
  ['Studies in form', 'fashion'],
  ['Drawn to the sea', 'sailing'],
  ['Summer, unhurried', 'lifestyle'],
].map(([title, category]) => ({
  title, category, description: 'AI concept imagery for this demo.',
  image_url: '/images/' + category + '.jpg',
  source_url: 'https://example.com/' + category,
}));

type Preview = { candidates: ImportCandidate[]; media: FoundMedia[]; alreadySaved: number; warnings: string[] };
type SaveResult = { message: string; saved?: boolean };

function mediaCount(items: FoundMedia[]) {
  const photos = items.filter(item => item.kind === 'photo').length;
  const videos = items.length - photos;
  return [
    photos ? photos.toLocaleString() + (photos === 1 ? ' photo' : ' photos') : '',
    videos ? videos.toLocaleString() + (videos === 1 ? ' video' : ' videos') : '',
  ].filter(Boolean).join(' and ');
}

export default function ImportPanel({ demo = false }: { demo?: boolean }) {
  const [url, setUrl] = useState(demo ? 'https://example.com/' : '');
  const [scan, setScan] = useState<Preview | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState<'preview' | 'media' | 'projects' | null>(null);
  const [scanError, setScanError] = useState('');
  const [mediaResult, setMediaResult] = useState<SaveResult | null>(null);
  const [projectResult, setProjectResult] = useState<SaveResult | null>(null);
  const selectedMedia = scan?.media.filter(item => !excluded.includes(item.url)) ?? [];

  async function preview(event: FormEvent) {
    event.preventDefault();
    setScan(null);
    setExcluded([]);
    setScanError('');
    setMediaResult(null);
    setProjectResult(null);
    setBusy('preview');
    try {
      let result: Preview;
      if (demo) {
        result = {
          candidates: exampleProjects,
          media: exampleProjects.map(item => ({ url: item.image_url, name: item.title, kind: 'photo' })),
          alreadySaved: 0,
          warnings: [],
        };
      } else {
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        result = data;
      }
      setScan(result);
      setSelected(result.candidates.map((_, index) => index));
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Preview failed. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function saveMedia() {
    setBusy('media');
    setMediaResult(null);
    try {
      if (demo) {
        setMediaResult({ message: 'Demo complete. These are sample photos and no files were saved.', saved: true });
        return;
      }
      const { added, skipped } = await saveImportedMedia(selectedMedia);
      setMediaResult({ message: `Added ${added.toLocaleString()} items to Media.${skipped ? ` Skipped ${skipped.toLocaleString()} already saved.` : ''}`, saved: true });
    } catch (error) {
      setMediaResult({ message: error instanceof Error ? error.message : 'Media could not be saved. Please try again.' });
    } finally {
      setBusy(null);
    }
  }

  async function saveProjects() {
    if (!scan) return;
    setBusy('projects');
    setProjectResult(null);
    try {
      if (demo) {
        setProjectResult({ message: 'Demo complete. No project drafts were created.', saved: true });
        return;
      }
      const added = await saveImported(scan.candidates.filter((_, index) => selected.includes(index)));
      setProjectResult({
        message: added ? `Created ${added} private project ${added === 1 ? 'draft' : 'drafts'}.` : 'The selected project drafts are already in Projects.',
        saved: true,
      });
    } catch (error) {
      setProjectResult({ message: error instanceof Error ? error.message : 'Projects could not be saved. Please try again.' });
    } finally {
      setBusy(null);
    }
  }

  return <>
    <div className="import-intro">
      <div className="import-icon"><Globe size={24} /></div>
      <h2>Import from a website</h2>
      <p>Scan your website, then choose the photos, videos and project drafts to bring into your studio.</p>
    </div>
    <form onSubmit={preview} className="import-form">
      <label htmlFor="website">Your current website</label>
      <div className="url-field">
        <input id="website" type="text" inputMode="url" autoCapitalize="none" spellCheck={false} autoComplete="url" required
          value={url} onChange={event => setUrl(event.target.value)} placeholder="www.yourwebsite.com" />
        <ActionButton busy={busy === 'preview'} className="primary-button" disabled={!!busy}>
          {busy === 'preview' ? 'Scanning website…' : <>Preview import <ArrowRight size={16} /></>}
        </ActionButton>
      </div>
      <p>Enter the address as you’d type it in your browser.</p>
    </form>
    {scanError && <p role="alert" className="import-status">{scanError}</p>}
    {scan && <div className="import-review">
      <p role="status">{demo ? 'Sample results' : 'Scan complete.'} {scan.alreadySaved > 0 && `Skipped ${scan.alreadySaved.toLocaleString()} items already in Media.`}</p>
      {scan.warnings.map(warning => <p key={warning} className="warning">{warning}</p>)}
      <section className="studio-panel" aria-labelledby="import-media-heading">
        <h2 id="import-media-heading">Photos and videos</h2>
        {!mediaResult?.saved && (scan.media.length ? <p>{mediaCount(scan.media)} found. Save the selected items to your Media library. They stay private until you add them to a page and publish.</p>
          : <p>No new photos or videos to save.</p>)}
        {scan.media.length > 0 && !mediaResult?.saved && <>
          <ActionButton busy={busy === 'media'} className="primary-button" disabled={!!busy || !selectedMedia.length} onClick={saveMedia}>
            {busy === 'media' ? 'Saving to Media…' : selectedMedia.length ? `Save ${mediaCount(selectedMedia)} to Media` : 'Select photos or videos to save'}
          </ActionButton>
          <details>
            <summary>Review photos and videos</summary>
            <ul>{scan.media.map(item => <li key={item.url}><label>
              <input type="checkbox" disabled={!!busy} checked={!excluded.includes(item.url)}
                onChange={event => setExcluded(current => event.target.checked ? current.filter(url => url !== item.url) : [...current, item.url])} />
              {' '}{item.name} · {vimeoEmbed(item.url) ? 'Vimeo link' : item.kind}
            </label></li>)}</ul>
          </details>
        </>}
        {mediaResult && <p role="status">{mediaResult.message} {mediaResult.saved && !demo && <Link href="/studio/media">Open Media library →</Link>}</p>}
      </section>
      {scan.candidates.length > 0 && <details className="studio-panel">
        <summary>Project drafts (optional) · {scan.candidates.length} pages found</summary>
        <p>Create editable project drafts from the selected pages. Their titles and covers go to Projects. Use the Media section above to save photos and videos.</p>
        {!projectResult?.saved && <>
          <ActionButton busy={busy === 'projects'} className="secondary-button" disabled={!!busy || !selected.length} onClick={saveProjects}>
            {busy === 'projects' ? 'Saving drafts…' : `Save ${selected.length} project ${selected.length === 1 ? 'draft' : 'drafts'}`}
          </ActionButton>
          <div className="import-results">{scan.candidates.map((item, index) => <label className="import-result" key={item.source_url}>
            <input type="checkbox" disabled={!!busy} checked={selected.includes(index)}
              onChange={() => setSelected(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index])} />
            {item.image_url && <img src={item.image_url} alt="" referrerPolicy="no-referrer" />}
            <div><strong>{item.title}</strong><p>{item.description || 'No description found.'}</p><small>{new URL(item.source_url).pathname}</small></div>
          </label>)}</div>
        </>}
        {projectResult && <p role="status">{projectResult.message} {projectResult.saved && !demo && <Link href="/studio/projects">Open Projects →</Link>}</p>}
      </details>}
    </div>}
 <section className="studio-panel squarespace-import-help" aria-labelledby="squarespace-import-heading">
   <h2 id="squarespace-import-heading">Moving from Squarespace?</h2>
   <details>
     <summary>How to bring over your photos</summary>
     <p><strong>Start with the website scan above.</strong> Fresnel can find many public photos in one pass. If a gallery is missing, scan that gallery’s own page address and save the new results.</p>
     <p><strong>Download individual missing images from Squarespace.</strong> Its Asset Library downloads photos one at a time.</p>
     <ol>
       <li>Sign in to Squarespace on a computer and open your site’s <strong>Assets</strong> panel.</li>
       <li>Find the image, open its three-dot menu and choose <strong>File Details</strong>.</li>
       <li>Right-click the image preview and save it to your computer. Repeat for any other missing images.</li>
     </ol>
     <p>In Fresnel, saving photos and videos to <strong>Media</strong> keeps their source links. Use <strong>Keep private original</strong> on an individual photo in Media to keep a copy. Before taking the old site offline, check that the image URLs on your published portfolio are hosted somewhere that will stay available.</p>
     <p><a href="https://support.squarespace.com/hc/en-us/articles/206542377-Add-and-reuse-images-with-the-Asset-library" target="_blank" rel="noreferrer">Squarespace’s Asset Library instructions ↗</a></p>
   </details>
   <details>
     <summary>How to play a short video on your Fresnel site</summary>
     <p>Imported Vimeo films appear as links in <strong>Media → Videos</strong>. For a homepage loop, start with an MP4 export of your clip and host it at a public HTTPS file URL.</p>
     <ol>
       <li>In <Link href="/studio/website">Edit website</Link>, select the <strong>Campaign Stories</strong> template under <strong>Design</strong>.</li>
       <li>Go to <strong>Pages → Portfolio content</strong> and paste the direct file address into <strong>Showreel video URL</strong>. If a direct video is already in Media, use <strong>Choose showreel</strong> on Homepage.</li>
       <li>Choose a homepage cover photo as the still shown while the clip loads. Save and check the draft on desktop and mobile.</li>
     </ol>
     <p>The homepage plays the clip in a muted loop. For a quicker start, use a short, compressed H.264 MP4 exported for web playback.</p>
   </details>
 </section>
  </>;
}
