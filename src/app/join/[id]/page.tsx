import { notFound } from 'next/navigation';
import AccountPage from '@/components/AccountPage';
import { workspaceIdPattern } from '@/lib/studio-access';

export default async function JoinStudio({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  if (!workspaceIdPattern.test(id)) notFound();
  return <AccountPage signup studio={id} error={(await searchParams).error} />;
}
