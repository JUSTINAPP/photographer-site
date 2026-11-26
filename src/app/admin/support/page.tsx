import { requirePlatformAdmin, platformStudios } from '@/lib/platform-admin';
import { platformDate } from '@/lib/platform-types';
import { ActionLink, SubmitButton } from '@/components/ActionFeedback';
import { endSupport } from '../actions';

export default async function SupportActivity() {
  const { db } = await requirePlatformAdmin();
  const [studios, sessions, activity] = await Promise.all([
    platformStudios(),
    db.from('platform_support_sessions').select('*').order('started_at', { ascending: false }).limit(100),
    db.from('platform_activity').select('id,kind,workspace_id,details,created_at').order('created_at', { ascending: false }).limit(50),
  ]);
  const names = new Map(studios.map(studio => [studio.id, studio.name]));
  return <>
    <div className="studio-page-heading"><div><h1>Support activity</h1><p>A record of studio preparation, support access and account handovers.</p></div><form action={endSupport}><SubmitButton className="secondary-button">Close my support access</SubmitButton></form></div>
    {sessions.error || activity.error ? <p role="alert">Support activity could not be loaded.</p> : <>
      <section className="studio-panel"><h2>Support sessions</h2>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Studio</th><th>Reason</th><th>Opened</th><th>Access ends</th><th>Status</th></tr></thead><tbody>
          {(sessions.data ?? []).map(s => <tr key={s.id}><td><ActionLink href={'/admin/studios/' + s.workspace_id}>{names.get(s.workspace_id) ?? 'Studio'}</ActionLink></td><td>{s.reason}</td><td>{platformDate(s.started_at)}</td><td>{new Date(s.ends_at).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td><td>{s.ended_at ? 'Closed' : Date.parse(s.ends_at) > Date.now() ? 'Open' : 'Expired'}</td></tr>)}
        </tbody></table>{!sessions.data?.length && <p>No support sessions yet.</p>}</div>
      </section>
      <section className="studio-panel"><h2>Recent activity</h2>{activity.data?.map(entry => <p key={entry.id}>{platformDate(entry.created_at)} · {entry.kind.replaceAll('_', ' ')}{entry.workspace_id ? ' · ' + (names.get(entry.workspace_id) ?? 'Studio') : ''}</p>)}{!activity.data?.length && <p>No activity recorded yet.</p>}</section>
    </>}
  </>;
}
