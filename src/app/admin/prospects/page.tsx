import { requirePlatformAdmin } from '@/lib/platform-admin';
import { platformDate, prospectStages } from '@/lib/platform-types';
import ProspectForm from '@/components/admin/ProspectForm';
import { ActionLink, SubmitButton } from '@/components/ActionFeedback';
import TeamAccessSelect from '@/components/TeamAccessSelect';

export default async function Prospects({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string; due?: string }> }) {
  const { db } = await requirePlatformAdmin();
  const { q = '', stage = '', due } = await searchParams;
  const { data, error } = await db.from('platform_prospects').select('*').order('created_at', { ascending: false });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(new Date());
  const all = data ?? [];
  const isDue = (p: (typeof all)[number]) => p.next_date && p.next_date <= today && !['won', 'lost'].includes(p.stage);
  const rows = all.filter(p => (!stage || p.stage === stage) && (!due || isDue(p))
    && (p.name + ' ' + p.email + ' ' + p.contact_name).toLowerCase().includes(q.toLowerCase()));
  return <>
    <div className="studio-page-heading"><div><h1>Prospects</h1><p>Photographers and studios you would like to welcome to Fresnel.</p></div><a href="#add-prospect" className="primary-button">+ New prospect</a></div>
    <div className="admin-stats">
      {[['Prospects', all.length], ['In conversation', all.filter(p => ['contacted', 'replied', 'demo'].includes(p.stage)).length], ['Onboarding', all.filter(p => p.stage === 'onboarding').length], ['Follow-ups due', all.filter(isDue).length]].map(([label, value]) =>
        <div className="studio-panel" key={label}><p>{label}</p><strong>{value}</strong></div>)}
    </div>
    <form action="/admin/prospects" className="admin-search">
      <label>Search<input name="q" type="search" defaultValue={q} placeholder="Studio, photographer or email" /></label>
      <label>Stage<TeamAccessSelect name="stage" label="Filter stage" initial={stage} options={[['', 'All stages'], ...prospectStages]} /></label>
      <label className="rights-check"><input name="due" type="checkbox" value="1" defaultChecked={!!due} /> Follow-ups due</label><SubmitButton className="secondary-button">Filter</SubmitButton>
    </form>
    {error ? <p role="alert">Prospects could not be loaded.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Prospect</th><th>Stage</th><th>Next step</th><th>Follow-up</th></tr></thead><tbody>
      {rows.map(p => <tr key={p.id}><td><ActionLink href={'/admin/prospects/' + p.id}><strong>{p.name}</strong></ActionLink><small>{p.email || 'Email needed'}</small></td><td>{prospectStages.find(([id]) => id === p.stage)?.[1]}</td><td>{p.next_step || '—'}</td><td className={isDue(p) ? 'admin-overdue' : ''}>{platformDate(p.next_date)}</td></tr>)}
    </tbody></table>{!rows.length && <p className="studio-panel">No prospects match these filters.</p>}</div>}
    <section className="studio-panel" id="add-prospect"><h2>New prospect</h2><ProspectForm /></section>
  </>;
}
