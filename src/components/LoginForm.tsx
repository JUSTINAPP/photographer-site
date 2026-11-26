'use client';

import { SubmitButton } from '@/components/ActionFeedback';

import { useActionState } from 'react';
import { requestSignIn } from '@/app/login/actions';

export default function LoginForm({ signup = false, studio }: { signup?: boolean; studio?: string }) {
  const [state, action, pending] = useActionState(requestSignIn.bind(null, signup, studio), { message: '' });
  return <form action={action}>
    <label htmlFor="email">Email address</label>
    <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourstudio.com" />
    <label htmlFor="password">Password</label>
    <input id="password" name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 12 : undefined} required />
    {signup && <p>Use at least 12 characters.</p>}
    <SubmitButton className="primary-button account-submit">
      {pending ? (signup ? 'Creating account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in'}
    </SubmitButton>
    <p role="status">{state.message}</p>
  </form>;
}
