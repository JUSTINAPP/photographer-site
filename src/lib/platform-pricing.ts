import { createClient } from '@supabase/supabase-js';

export type PlanPrice = { id: string; name: string; monthly: number; annual: number };
export const defaultPrices: PlanPrice[] = [
  { id: 'independent', name: 'Website', monthly: 22, annual: 19 },
  { id: 'studio', name: 'Studio', monthly: 89, annual: 69 },
  { id: 'production', name: 'Production', monthly: 149, annual: 119 },
];

export async function publicPrices(): Promise<PlanPrice[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return defaultPrices;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) } });
  const { data, error } = await db.from('platform_prices').select('id,monthly,annual_monthly');
  if (error) return defaultPrices;
  return defaultPrices.map(plan => {
    const saved = data.find(row => row.id === plan.id);
    return saved ? { ...plan, monthly: Number(saved.monthly), annual: Number(saved.annual_monthly) } : plan;
  });
}
