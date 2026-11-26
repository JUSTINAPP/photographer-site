'use client';

import { useActionState } from 'react';
import { publishPrices } from '@/app/admin/pricing/actions';
import { SubmitButton } from '@/components/ActionFeedback';
import type { PlanPrice } from '@/lib/platform-pricing';

export default function PricingForm({ prices }: { prices: PlanPrice[] }) {
  const [state, action] = useActionState(publishPrices, { message: '' });
  return <form action={action}>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Plan</th><th>Monthly (A$)</th><th>Yearly monthly equivalent (A$)</th><th>Yearly total (A$)</th></tr></thead><tbody>
      {prices.map(plan => <tr key={plan.id}><td>{plan.name}</td><td><input aria-label={plan.name + ' monthly'} name={'monthly_' + plan.id} type="number" min="0" max="100000" step=".01" required defaultValue={plan.monthly} /></td><td><input aria-label={plan.name + ' annual monthly equivalent'} name={'annual_' + plan.id} type="number" min="0" max="100000" step=".01" required defaultValue={plan.annual} /></td><td>{(plan.annual * 12).toFixed(2)}</td></tr>)}
    </tbody></table></div>
    <p>The yearly total above reflects the saved prices. Publish to update the public pricing cards.</p>
    <SubmitButton className="primary-button">Publish pricing</SubmitButton><p role="status">{state.message}</p>
  </form>;
}
