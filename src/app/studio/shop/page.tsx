import { requireStudioAccess } from '@/lib/supabase';
import StudioShell from '@/components/StudioShell';

export default async function Shop() {
  await requireStudioAccess('owner');
  return <StudioShell active="Shop">
    <div className="studio-page-heading"><div><h1>Shop</h1><p>A space for your studio’s online shop.</p></div></div>
    <section className="studio-panel"><h2>Shop setup</h2><p>Products, fulfilment and payments will be configured once the shop details are ready.</p></section>
  </StudioShell>;
}
