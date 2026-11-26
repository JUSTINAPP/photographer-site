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
  const valid = /^[A-Za-z0-9_-]{32,256}$/i.test(token);
  return <main className="account-page">
    <div className="account-card login-content">
      <Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link>
      <h1>{valid ? 'Your studio is one step away' : 'Sign in to your studio'}</h1>
      <p>{valid ? 'Continue to verify your email and open your private photography studio. New accounts get their own studio automatically.' : 'This email link is incomplete. You can sign in with your email and password, or set a password for your existing account.'}</p>
      {valid && <ConfirmEmailForm token={token} />}
      <Link href="/login">Sign in with email and password</Link>
    <p><Link href="/forgot-password">Set or reset password</Link></p></div>
  </main>;
}
