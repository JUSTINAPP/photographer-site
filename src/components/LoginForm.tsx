'use client';

import { SubmitButton } from '@/components/ActionFeedback';

import { useActionState } from 'react';
import { requestSignIn } from '@/app/login/actions';

export default function LoginForm({ signup = false, studio }: { signup?: boolean; studio?: string }) {
  const [state, action, pending] = useActionState(requestSignIn.bind(null, signup, studio), { message: '' });
  return <form action={action}>
    <label htmlFor="email">Email address</label>
    <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourstudio.com" />
    <SubmitButton className="primary-button account-submit">
      {pending ? 'Sending…' : studio ? 'Send studio access link' : signup ? 'Send account link' : 'Send sign-in link'}
    </SubmitButton>
    <p role="status">{state.message}</p>
  </form>;
}
