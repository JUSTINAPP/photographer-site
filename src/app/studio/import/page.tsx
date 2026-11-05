import StudioShell from '@/components/StudioShell';import ImportPanel from '@/components/ImportPanel';import {requireStudioAccess} from '@/lib/supabase';
export default async function Import(){const {user}=await requireStudioAccess('edit');return <StudioShell active="Import website" email={user.email}><p className="eyebrow">WEBSITE IMPORT</p><ImportPanel/></StudioShell>}
