import Link from 'next/link';
import FresnelMark from '@/components/FresnelMark';
import LoginForm from '@/components/LoginForm';

export default function AccountPage({ signup = false, error, studio, websiteStart = false }: { signup?: boolean; error?: boolean | string; studio?: string; websiteStart?: boolean }) {
  return <main className="account-page">
    <div className="account-card login-content">
      <Link href="/" className="account-brand"><FresnelMark /> Fresnel Studios</Link>
      <h1>{studio ? 'Join a Fresnel studio' : signup ? websiteStart ? 'Create your website account' : 'Create your account' : 'Sign in to your studio'}</h1>
      <p>{studio ? 'Use the email address your studio invited. Sign in if you already have an account, or create one below.' : signup ? websiteStart ? 'Create your free account to save your website. Confirm your email, then continue straight to your chosen website starting point.' : 'Create a private studio with your email and password. Confirm your email once to get started.' : 'Welcome back. Enter your email and password to open your studio.'}</p>
      {error && <p role="alert">{error === 'access' ? 'This email address does not have access to the invited studio. Check the address with the studio owner and try again.' : 'Your email link could not be completed. Sign in with your password or set one below.'}</p>}
      <LoginForm signup={signup} studio={studio} />
      <p><Link href="/forgot-password">Set or reset password</Link></p>
      {studio && <p><Link href={'/join/' + studio + (signup ? '?mode=login' : '?mode=signup')}>{signup ? 'Already registered? Sign in' : 'New here? Create an account'}</Link></p>}
      {!studio && <p>{signup ? 'Already have an account? ' : 'New to Fresnel Studios? '}
        <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Start free'}</Link>
      </p>}
      <Link className="tour-link" href="/demo">Explore the studio demo ↗</Link>
    </div>
  </main>;
}
