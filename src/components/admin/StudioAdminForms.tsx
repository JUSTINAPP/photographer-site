'use client';

import { useActionState } from 'react';
import { prepareStudio, openSupport, saveStudioAccount } from '@/app/admin/actions';
import { SubmitButton } from '@/components/ActionFeedback';
import TeamAccessSelect from '@/components/TeamAccessSelect';
import { accountStatuses, planOptions, type PlatformStudio } from '@/lib/platform-types';

export function PrepareStudioForm({ name = '', email = '', website = '', prospect }: { name?: string; email?: string; website?: string; prospect?: string }) {
  const [state, action] = useActionState(prepareStudio, { message: '' });
  return <form action={action} className="admin-form">
    {prospect && <input type="hidden" name="prospect" value={prospect} />}
    <label>Studio / photographer name<input name="name" required maxLength={100} defaultValue={name} /></label>
    <label>Photographer’s email<input type="email" name="email" required maxLength={254} defaultValue={email} /></label>
    <label>Current website<input name="website" placeholder="www.photographer.com" defaultValue={website} /></label>
    <SubmitButton className="primary-button">Prepare private studio</SubmitButton>
    <p role="status">{state.message}</p>
  </form>;
}

export function SupportForm({ studio }: { studio: string }) {
  const [state, action] = useActionState(openSupport.bind(null, studio), { message: '' });
  return <form action={action} className="admin-form">
    <label>Reason for access<input name="reason" required minLength={3} maxLength={500} placeholder="Prepare portfolio and import current website" /></label>
    <label>Support duration<TeamAccessSelect name="minutes" label="Support duration" initial="60" options={[['30', '30 minutes'], ['60', '1 hour'], ['240', '4 hours']]} /></label>
    <SubmitButton className="primary-button">Open studio for onboarding →</SubmitButton>
    <p role="status">{state.message}</p>
  </form>;
}

export function StudioAccountForm({ studio }: { studio: PlatformStudio }) {
  const [state, action] = useActionState(saveStudioAccount.bind(null, studio.id), { message: '' });
  return <form action={action} className="admin-form">
    <label>Plan<TeamAccessSelect name="plan" label="Plan" initial={studio.plan} options={planOptions} /></label>
    <label>Account status<TeamAccessSelect name="status" label="Account status" initial={studio.status} options={accountStatuses} /></label>
    <label>Trial ends<input type="date" name="trial_ends_at" defaultValue={studio.trial_ends_at ?? ''} /></label>
    <label className="admin-full">Internal notes<textarea name="notes" defaultValue={studio.notes} maxLength={10000} rows={5} /></label>
    <SubmitButton className="primary-button">Save account</SubmitButton><p role="status">{state.message}</p>
  </form>;
}

export function OpenBackendButton({ studio }: { studio: string }) {
  const [state, action, pending] = useActionState(openSupport.bind(null, studio), { message: '' });
  return <form action={action}>
    <input type="hidden" name="reason" value="Open studio backend from Fresnel master admin" />
    <input type="hidden" name="minutes" value="60" />
    <input type="hidden" name="destination" value="overview" />
    <SubmitButton className="primary-button">{pending ? 'Opening backend…' : 'Open backend →'}</SubmitButton>
    {state.message && <p role="alert">{state.message}</p>}
  </form>;
}
