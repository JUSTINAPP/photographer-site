'use client';
import { useActionState } from 'react';
import { requestPasswordReset, savePassword } from '@/app/login/actions';
import { SubmitButton } from './ActionFeedback';
export default function PasswordForm({ reset = false }: { reset?: boolean }) {
  const [state, action, pending] = useActionState(reset ? savePassword : requestPasswordReset, { message: '' });
  return <form action={action}>
    {reset ? <><label htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required /><p>Use at least 12 characters.</p><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></> : <><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required /></>}
    <SubmitButton className="primary-button account-submit">{pending ? 'Please wait…' : reset ? 'Save password and open studio' : 'Send password setup email'}</SubmitButton>
    <p role="status">{state.message}</p>
  </form>;
}
