'use client';

import { ActionButton } from '@/components/ActionFeedback';

import { useState } from 'react';
import { keepMediaOriginal } from '@/app/studio/media/actions';

const formats = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  reel: [1080, 1920],
} as const;

export default function MediaExports({ id, name, kind }: { id: string; name: string; kind: 'photo' | 'video' }) {
  const [format, setFormat] = useState<keyof typeof formats>('square');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [original, setOriginal] = useState('');

  async function process(exportImage: boolean) {
    setBusy(exportImage ? 'export' : 'original');
    setMessage('');
    try {
      const result = await keepMediaOriginal(id);
      if (!result.url) throw new Error(result.error);
      setOriginal(result.url);
      if (!exportImage) {
        setMessage('Original saved to your private library.');
        return;
      }
      const response = await fetch(result.url);
      if (!response.ok) throw new Error('Could not open the private photo.');
      const image = await createImageBitmap(await response.blob());
      const [width, height] = formats[format];
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) { image.close(); throw new Error('Image export is unavailable in this browser.'); }
      // Bowerbird's browser canvas resizing approach, with a centred crop for social formats.
      const scale = Math.max(width / image.width, height / image.height);
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight);
      image.close();
      const file = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!file) throw new Error('The crop could not be exported.');
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || 'photo'}-${format}.jpg`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('JPEG crop exported.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The file could not be processed.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="media-actions">
      <ActionButton busy={busy === 'original'} className="secondary-button" disabled={!!busy} onClick={() => process(false)}>Keep private original</ActionButton>
      {original && <a href={original} target="_blank" rel="noreferrer">Open saved original ↗</a>}
      {kind === 'photo' && <>
        <label>Crop format
          <select disabled={!!busy} value={format} onChange={event => setFormat(event.target.value as keyof typeof formats)}>
            <option value="square">Square · 1080 × 1080</option>
            <option value="portrait">Portrait · 1080 × 1350</option>
            <option value="reel">Reels cover · 1080 × 1920</option>
          </select>
        </label>
        <ActionButton busy={busy === 'export'} className="primary-button" disabled={!!busy} onClick={() => process(true)}>Export JPEG crop</ActionButton>
      </>}
      <p role="status">{busy ? 'Preparing file…' : message}</p>
    </div>
  );
}
