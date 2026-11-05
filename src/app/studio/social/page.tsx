import StudioPlanner, { type PlannerParams } from '@/components/StudioPlanner';

export default async function Social({ searchParams }: { searchParams: Promise<PlannerParams> }) {
  return <StudioPlanner social params={await searchParams} />;
}
