import { notFound } from 'next/navigation';
import AccountPage from '@/components/AccountPage';
import { workspaceIdPattern } from '@/lib/studio-access';

export default async function JoinStudio({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { id } = await params;
  if (!workspaceIdPattern.test(id)) notFound();
  const query = await searchParams;
  return <AccountPage signup={query.mode !== 'login'} studio={id} error={query.error} />;
}
