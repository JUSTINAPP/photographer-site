import StudioShell from '@/components/StudioShell';
import { ActionSpinner } from '@/components/ActionFeedback';
export default function LoadingSocial(){return <StudioShell active="Social calendar"><h1>Social workspace</h1><p data-page-loading role="status"><ActionSpinner/> Loading your studio’s posts and media…</p></StudioShell>}
