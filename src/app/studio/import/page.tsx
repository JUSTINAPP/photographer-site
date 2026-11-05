import StudioShell from '@/components/StudioShell';import ImportPanel from '@/components/ImportPanel';import {requireStudio} from '@/lib/supabase';
export default async function Import(){const {user}=await requireStudio();return <StudioShell active="Import website" email={user.email}><p className="eyebrow">WEBSITE IMPORT</p><ImportPanel/></StudioShell>}
