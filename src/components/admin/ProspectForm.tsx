'use client';

import { useActionState } from 'react';
import { saveProspect } from '@/app/admin/prospects/actions';
import { SubmitButton } from '@/components/ActionFeedback';
import TeamAccessSelect from '@/components/TeamAccessSelect';
import { prospectStages } from '@/lib/platform-types';

export type Prospect = {
  id: string; name: string; email: string; website: string; stage: string;
  contact_name: string; source: string; next_step: string; next_date: string | null; notes: string;
};

export default function ProspectForm({ prospect }: { prospect?: Prospect }) {
  const [state, action] = useActionState(saveProspect.bind(null, prospect?.id ?? null), { message: '' });
  return <form action={action} className="admin-form">
    <label>Photographer / studio<input name="name" defaultValue={prospect?.name} maxLength={180} required /></label>
    <label>Email<input name="email" type="email" defaultValue={prospect?.email} maxLength={254} /></label>
    <label>Website<input name="website" defaultValue={prospect?.website} placeholder="www.photographer.com" maxLength={2048} /></label>
    <label>Contact person<input name="contact_name" defaultValue={prospect?.contact_name} maxLength={180} /></label>
    <label>Source<input name="source" defaultValue={prospect?.source} placeholder="Referral, event, Instagram…" maxLength={180} /></label>
    <label>Stage<TeamAccessSelect name="stage" label="Prospect stage" initial={prospect?.stage ?? 'new'} options={prospectStages} /></label>
    <label>Next step<input name="next_step" defaultValue={prospect?.next_step} maxLength={500} /></label>
    <label>Follow-up date<input type="date" name="next_date" defaultValue={prospect?.next_date ?? ''} /></label>
    <label className="admin-full">Notes<textarea name="notes" defaultValue={prospect?.notes} rows={6} maxLength={20000} /></label>
    <SubmitButton className="primary-button">{prospect ? 'Save prospect' : 'Add prospect'}</SubmitButton>
    <p role="status">{state.message}</p>
  </form>;
}
