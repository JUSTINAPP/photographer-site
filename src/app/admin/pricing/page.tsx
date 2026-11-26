import { requirePlatformAdmin } from '@/lib/platform-admin';
import { defaultPrices } from '@/lib/platform-pricing';
import PricingForm from '@/components/admin/PricingForm';

export default async function AdminPricing() {
  const { db } = await requirePlatformAdmin();
  const { data, error } = await db.from('platform_prices').select('*');
  const prices = defaultPrices.map(plan => {
    const row = data?.find(item => item.id === plan.id);
    return row ? { ...plan, monthly: Number(row.monthly), annual: Number(row.annual_monthly) } : plan;
  });
  return <>
    <div className="studio-page-heading"><div><h1>Pricing</h1><p>Set the launch prices displayed on the Fresnel home and pricing pages.</p></div></div>
    <section className="studio-panel"><h2>Plans in Australian dollars</h2><p>These are the public proposed launch prices. Subscription checkout and payment collection will need to be connected before charging customers.</p>{error ? <p role="alert">Pricing could not be loaded.</p> : <PricingForm prices={prices} />}</section>
  </>;
}
