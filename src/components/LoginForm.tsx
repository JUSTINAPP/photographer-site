'use client';

import { LoaderCircle } from 'lucide-react';
import { useActionState } from 'react';
import { requestSignIn } from '@/app/login/actions';

export default function LoginForm({ signup = false }: { signup?: boolean }) {
  const [state, action, pending] = useActionState(requestSignIn.bind(null, signup), { message: '' });
  return <form action={action}>
    <label htmlFor="email">Email address</label>
    <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourstudio.com" />
    <button className="primary-button account-submit" disabled={pending} aria-busy={pending}>
      {pending && <LoaderCircle className="account-spinner" size={16} aria-hidden="true" />}
      {pending ? 'Sending…' : signup ? 'Send account link' : 'Send sign-in link'}
    </button>
    <p role="status">{state.message}</p>
  </form>;
}
