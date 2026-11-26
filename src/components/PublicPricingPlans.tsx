import PricingPlans from './PricingPlans';
import { publicPrices } from '@/lib/platform-pricing';

export default async function PublicPricingPlans() {
  return <PricingPlans prices={await publicPrices()} />;
}
