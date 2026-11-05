import Link from 'next/link';
import FresnelMark from '@/components/FresnelMark';
import LoginForm from '@/components/LoginForm';

export default function AccountPage({ signup = false, error = false }: { signup?: boolean; error?: boolean }) {
  return <main className="account-page">
    <div className="account-card login-content">
      <Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link>
      <h1>{signup ? 'Create your account' : 'Sign in to your studio'}</h1>
      <p>{signup ? 'Enter your email to create a private studio for your portfolio and projects.' : 'Enter your email and we’ll send you a secure sign-in link.'}</p>
      {error && <p role="alert">Your sign-in link could not be completed. Please request a new link.</p>}
      <LoginForm signup={signup} />
      <p>{signup ? 'Already have an account? ' : 'New to Fresnel Studios? '}
        <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Start free'}</Link>
      </p>
      <Link className="tour-link" href="/demo">Explore the studio demo ↗</Link>
    </div>
  </main>;
}
