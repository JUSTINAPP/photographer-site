import Link from 'next/link';
import FresnelMark from '@/components/FresnelMark';
import InvitationWelcome from '@/components/InvitationWelcome';
export const metadata = { title: 'Your studio invitation — Fresnel Studios', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default function Welcome() {
  return <main className="account-page"><div className="account-card login-content"><Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link><h1>Welcome to your studio</h1><p>First verify your invitation, then choose your password. The website prepared for you will be waiting inside.</p><InvitationWelcome /><Link href="/login">Sign in with email and password</Link><p><Link href="/forgot-password">Set or reset password</Link></p></div></main>;
}
