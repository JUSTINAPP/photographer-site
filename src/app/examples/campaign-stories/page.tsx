import CampaignWebsite from '@/components/CampaignWebsite';
import { normaliseWebsite } from '@/lib/website';
import { PRESETS } from '@/lib/website-theme';

export const metadata = { title: 'Campaign Stories — Fresnel Studios template' };

export default async function CampaignStories({ searchParams }: { searchParams: Promise<{ about?: string; campaign?: string }> }) {
  const site = normaliseWebsite({
    name: 'Rowan Vale',
    headline: 'Photography in motion.',
    theme: PRESETS.campaign.theme,
  });
  return <main><CampaignWebsite site={site} projects={[]} base="/examples/campaign-stories" view={await searchParams} sample /></main>;
}
