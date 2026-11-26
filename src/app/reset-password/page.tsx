import Link from 'next/link';
import FresnelMark from '@/components/FresnelMark';
import PasswordForm from '@/components/PasswordForm';
import { database } from '@/lib/supabase';
import { redirect } from 'next/navigation';
export const metadata = { title: 'Password — Fresnel Studios', robots: { index: false, follow: false } };
export default async function PasswordPage() {
  if (!(await (await database()).auth.getUser()).data.user) redirect('/forgot-password');
  return <main className="account-page"><div className="account-card login-content"><Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link><h1>Choose your password</h1><p>Use this password with your email address whenever you return.</p><PasswordForm reset={true} /><p><Link href="/login">Back to sign in</Link></p></div></main>;
}
