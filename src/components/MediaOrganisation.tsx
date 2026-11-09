'use client';

import { useActionState, useState } from 'react';
import { createMediaCategory, organiseMedia } from '@/app/studio/media/actions';
import { SubmitButton } from './ActionFeedback';

export default function MediaOrganisation({ studioId, categories, hasFiles }: {
  studioId: string;
  categories: { id: string; name: string }[];
  hasFiles: boolean;
}) {
  const [categoryStatus, createCategory] = useActionState(createMediaCategory.bind(null, studioId), '');
  const [status, apply] = useActionState(organiseMedia.bind(null, studioId), '');
  const [operation, setOperation] = useState(categories.length ? 'add' : 'year');

  return <details className="studio-panel media-organise">
    <summary>Organise media</summary>
    <form action={createCategory}>
      <label>New category <input name="name" maxLength={60} required placeholder="e.g. Sailing" /></label>
      <SubmitButton className="secondary-button">Add category</SubmitButton>
      {categoryStatus && <p role="status">{categoryStatus}</p>}
    </form>
    {hasFiles && <form action={apply} id="organise-media">
      <p>Tick files below or select the whole page, then apply a category or year.</p>
      <button type="button" className="secondary-button" onClick={() => {
        document.querySelectorAll<HTMLInputElement>('input[form="organise-media"][name="media"]').forEach(input => { input.checked = true; });
      }}>Select all on this page</button>
      <label>Action <select name="operation" value={operation} onChange={event => setOperation(event.target.value)}>
        <option value="year">Set or clear year</option>
        {categories.length > 0 && <><option value="add">Add to category</option><option value="remove">Remove from category</option></>}
      </select></label>
      {operation === 'year'
        ? <label>Year <input name="year" type="number" min={1800} max={2100} placeholder="Leave blank to clear" /></label>
        : <label>Category <select name="category" required defaultValue="">
          <option value="">Choose category</option>
          {categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select></label>}
      <SubmitButton className="primary-button">Apply to selected files</SubmitButton>
      {status && <p role="status">{status}</p>}
    </form>}
  </details>;
}
