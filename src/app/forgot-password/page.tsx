import Link from 'next/link';
import FresnelMark from '@/components/FresnelMark';
import PasswordForm from '@/components/PasswordForm';
export const metadata = { title: 'Password — Fresnel Studios', robots: { index: false, follow: false } };
export default async function PasswordPage() {
  return <main className="account-page"><div className="account-card login-content"><Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link><h1>Set or reset your password</h1><p>Previously signed in by email link? Set a password here using the same email address. Your studio and images stay connected to your account.</p><PasswordForm reset={false} /><p><Link href="/login">Back to sign in</Link></p></div></main>;
}
