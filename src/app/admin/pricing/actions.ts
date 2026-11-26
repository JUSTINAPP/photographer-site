'use server';

import { revalidatePath } from 'next/cache';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { defaultPrices } from '@/lib/platform-pricing';

export async function publishPrices(_previous: { message: string }, form: FormData) {
  const { db } = await requirePlatformAdmin();
  const prices = defaultPrices.map(plan => ({
    id: plan.id,
    monthly: Number(form.get('monthly_' + plan.id)),
    annual_monthly: Number(form.get('annual_' + plan.id)),
  }));
  if (prices.some(plan => !Number.isFinite(plan.monthly) || !Number.isFinite(plan.annual_monthly)
    || plan.monthly < 0 || plan.monthly > 100000 || plan.annual_monthly < 0 || plan.annual_monthly > plan.monthly))
    return { message: 'Enter valid prices. The annual monthly equivalent must be at most the monthly price.' };
  const { error } = await db.rpc('publish_platform_prices', { prices });
  if (error) return { message: 'Pricing could not be saved. Please try again.' };
  revalidatePath('/pricing');
  revalidatePath('/');
  revalidatePath('/admin/pricing');
  return { message: 'Pricing published to the website.' };
}
