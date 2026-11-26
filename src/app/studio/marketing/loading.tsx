import StudioShell from '@/components/StudioShell';
import { ActionSpinner } from '@/components/ActionFeedback';
export default function LoadingMarketing(){return <StudioShell active="Marketing"><h1>Marketing</h1><p role="status"><ActionSpinner/> Loading your studio’s marketing tools…</p></StudioShell>}
