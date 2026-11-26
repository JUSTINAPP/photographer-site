import Link from 'next/link';
import type { Metadata } from 'next';
import FresnelMark from '@/components/FresnelMark';
import ConfirmEmailForm from '@/components/ConfirmEmailForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Open your studio — Fresnel Studios',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function ConfirmEmail({ searchParams }: {
  searchParams: Promise<{ token_hash?: string }>;
}) {
  const { token_hash: token = '' } = await searchParams;
  const valid = /^[a-f0-9]{32,128}$/i.test(token);
  return <main className="account-page">
    <div className="account-card login-content">
      <Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link>
      <h1>{valid ? 'Your studio is one step away' : 'Request a new sign-in link'}</h1>
      <p>{valid ? 'Continue to verify your email and open your private photography studio. New accounts get their own studio automatically.' : 'This email link is incomplete. Sign in to request a fresh link.'}</p>
      {valid && <ConfirmEmailForm token={token} />}
      <Link href="/login">Request a fresh sign-in email</Link>
    </div>
  </main>;
}
