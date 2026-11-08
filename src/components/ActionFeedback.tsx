'use client';

import { LoaderCircle } from 'lucide-react';
import Link, { useLinkStatus } from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export function ActionSpinner() {
  return <LoaderCircle className="account-spinner action-spinner" size={16} aria-hidden="true" />;
}

export function ActionButton({ busy, children, disabled, ...props }: ComponentProps<'button'> & { busy?: boolean }) {
  return <button {...props} disabled={disabled || busy} aria-busy={busy}>
    {busy && <ActionSpinner />}{children}
  </button>;
}

export function SubmitButton({ children, ...props }: ComponentProps<'button'>) {
  const { pending, data } = useFormStatus();
  const busy = pending && (data?.get('intent') ?? '') === (props.name === 'intent' ? props.value : '');
  return <ActionButton {...props} disabled={props.disabled || pending} busy={busy}>{children}</ActionButton>;
}

function LinkSpinner() {
  const { pending } = useLinkStatus();
  return pending ? <span className="action-link-spinner" role="status" aria-label="Loading page"><ActionSpinner /></span> : null;
}

export function ActionLink({ children, ...props }: ComponentProps<typeof Link> & { children?: ReactNode }) {
  return <Link {...props}>{children}<LinkSpinner /></Link>;
}
