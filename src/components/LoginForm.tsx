'use client';

import { useActionState } from 'react';
import { requestSignIn } from '@/app/login/actions';

export default function LoginForm({ signup = false }: { signup?: boolean }) {
  const [state, action, pending] = useActionState(requestSignIn.bind(null, signup), { message: '' });
  return <form action={action}>
    <label htmlFor="email">Email address</label>
    <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourstudio.com" />
    <button className="primary-button" disabled={pending}>{pending ? 'Sending…' : signup ? 'Send account link' : 'Send sign-in link'}</button>
    <p role="status">{state.message}</p>
  </form>;
}
