import AccountPage from '@/components/AccountPage';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AccountPage error={!!error} />;
}
