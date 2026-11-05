import StudioPlanner, { type PlannerParams } from '@/components/StudioPlanner';

export default async function Calendar({ searchParams }: { searchParams: Promise<PlannerParams> }) {
  return <StudioPlanner params={await searchParams} />;
}
