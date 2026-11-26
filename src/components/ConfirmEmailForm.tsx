'use client';

import { useActionState } from 'react';
import { confirmEmail } from '@/app/auth/confirm/actions';
import { SubmitButton } from './ActionFeedback';

export default function ConfirmEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmEmail, { message: '' });
  return <form action={action}>
    <input type="hidden" name="token_hash" value={token} />
    <SubmitButton className="primary-button account-submit">{pending ? 'Opening your studio…' : 'Open my studio'}</SubmitButton>
    <p role={state.message ? 'alert' : 'status'}>{state.message}</p>
  </form>;
}
