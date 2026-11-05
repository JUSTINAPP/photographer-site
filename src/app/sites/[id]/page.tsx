import { notFound } from 'next/navigation';
import EditorialWebsite from '@/components/EditorialWebsite';
import { configured, database } from '@/lib/supabase';
import { normaliseWebsite, type WebsiteProject } from '@/lib/website';

export default async function PublishedWebsite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!configured() || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) notFound();
  const db = await database();
  const { data } = await db.rpc('published_studio_website', { site_id: id }).maybeSingle();
  const result = data as { settings: unknown; projects: WebsiteProject[] } | null;
  if (!result) notFound();
  return <main><EditorialWebsite site={normaliseWebsite(result.settings)} projects={result.projects} /></main>;
}
