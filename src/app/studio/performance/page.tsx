import StudioShell from '@/components/StudioShell';
import SpeedPanel from '@/components/SpeedPanel';
import {requireStudioAccess} from '@/lib/supabase';
export default async function SiteSpeed(){const {user}=await requireStudioAccess('admin');return <StudioShell active="Site speed" email={user.email}><h1>Site speed</h1><SpeedPanel/></StudioShell>}
