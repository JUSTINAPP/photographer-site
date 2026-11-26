'use client';

import { useActionState, useState } from 'react';
import { createMediaCategory, organiseMedia, organiseWebsitePage } from '@/app/studio/media/actions';
import { SubmitButton } from './ActionFeedback';

export default function MediaOrganisation({ studioId, categories, hasFiles, pages = [] }: {
  pages?: {id:string;title:string}[];
  studioId: string;
  categories: { id: string; name: string }[];
  hasFiles: boolean;
}) {
  const [categoryStatus, createCategory] = useActionState(createMediaCategory.bind(null, studioId), '');
  const [status, apply] = useActionState(async(previous:string,form:FormData)=>String(form.get('operation')).endsWith('-page')?organiseWebsitePage(studioId,previous,form):organiseMedia(studioId,previous,form), '');
  const [operation, setOperation] = useState(pages.length ? 'add-page' : categories.length ? 'add' : 'year');

  return <details className="studio-panel media-organise">
    <summary>Organise media into website sections, categories or years</summary>
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
        <option value="add-page">Add to website section / page</option><option value="remove-page">Remove from website section / page</option><option value="year">Set or clear year</option>
        {categories.length > 0 && <><option value="add">Add to category</option><option value="remove">Remove from category</option></>}
      </select></label>
      {operation.endsWith('-page')?<label>Website section / page<select name="page"><option value="home">Intro / Homepage</option>{pages.map(page=><option key={page.id} value={page.id}>{page.title}</option>)}</select><small>This changes the saved draft gallery, keeping original files in Media. Publish separately.</small></label>:operation === 'year'
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
