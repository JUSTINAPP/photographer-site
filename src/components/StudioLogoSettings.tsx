'use client';

import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { saveStudioSettings } from '@/app/studio/settings/actions';

export default function StudioLogoSettings({ id, name, logo, size }: { id: string; name: string; logo: string; size: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [height, setHeight] = useState(size);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return <form id="logo" action={saveStudioSettings.bind(null, id, 'logo')} className="studio-panel studio-setting-form settings-wide">
    <h2>Website logo</h2><p>Preview the logo used in your portfolio header and footer. Publish the website to apply the change.</p>
    <div className="settings-logo-preview">
      {preview || logo ? <img className="portfolio-logo" src={preview || logo} alt={name} style={{ height }} /> : <strong>{name}</strong>}
      <span>Work &nbsp; About &nbsp; Contact</span>
    </div>
    <label className="settings-logo-upload"><Upload size={20} />{file?.name || (logo ? 'Replace logo' : 'Upload logo')}
      <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setFile(event.target.files?.[0] ?? null)} />
      <small>PNG, JPEG or WebP up to 256 KB</small>
    </label>
    <label>Logo height · {height}px<input name="logoSize" type="range" min="24" max="120" value={height} onChange={event => setHeight(Number(event.target.value))} /></label>
    <button className="primary-button">Save logo</button>{' '}
    {logo && <button className="secondary-button" name="intent" value="remove">Remove logo</button>}
  </form>;
}
