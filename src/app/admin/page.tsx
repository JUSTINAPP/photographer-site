import { ActionLink } from '@/components/ActionFeedback';
import { PrepareStudioForm, OpenBackendButton } from '@/components/admin/StudioAdminForms';
import { platformStudios } from '@/lib/platform-admin';
import { platformDate } from '@/lib/platform-types';

export default async function AdminStudios({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const studios = await platformStudios();
  const query = ((await searchParams).q ?? '').trim().toLowerCase();
  const rows = studios.filter(studio => (studio.name + ' ' + studio.email).toLowerCase().includes(query));
  const recent = Date.now() - 30 * 86400000;
  const stats = [
    ['Signed-up studios', studios.filter(s => s.claimed).length],
    ['Prepared for onboarding', studios.filter(s => !s.claimed).length],
    ['Websites live', studios.filter(s => s.live).length],
    ['New in 30 days', studios.filter(s => Date.parse(s.created_at) >= recent).length],
  ];
  return <>
    <div className="studio-page-heading"><div><h1>Studios</h1><p>Manage photographer accounts, prepare portfolios and help customers get started.</p></div><a className="primary-button" href="#prepare">+ Prepare a studio</a></div>
    <div className="admin-stats">{stats.map(([label, value]) => <div className="studio-panel" key={label}><p>{label}</p><strong>{value}</strong></div>)}</div>
    <form className="admin-search" action="/admin"><label>Find a studio<input type="search" name="q" defaultValue={query} placeholder="Photographer, studio or email" /></label><button className="secondary-button">Search</button></form>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Studio</th><th>Plan / status</th><th>Content</th><th>Joined</th><th>Website</th><th>Backend</th></tr></thead><tbody>
      {rows.map(studio => <tr key={studio.id}>
        <td><ActionLink href={'/admin/studios/' + studio.id}><strong>{studio.name}</strong></ActionLink><small>{studio.email}</small><span className="admin-badge">{studio.claimed ? 'Account claimed' : 'Awaiting photographer'}</span></td>
        <td>{studio.plan}<small>{studio.status}</small></td>
        <td>{studio.media_count.toLocaleString()} media<small>{studio.project_count} campaigns · {studio.team_count} teammates</small></td>
        <td>{platformDate(studio.created_at)}<small>Last sign-in {platformDate(studio.last_sign_in_at)}</small></td>
        <td>{studio.live ? <a href={'/sites/' + studio.public_id} target="_blank" rel="noreferrer">Live ↗</a> : 'Draft'}</td>
        <td><OpenBackendButton studio={studio.id} /></td>
      </tr>)}
    </tbody></table>{!rows.length && <p className="studio-panel">No studios match this search.</p>}</div>
    <section id="prepare" className="studio-panel"><h2>Prepare a photographer’s studio</h2><p>Enter their details to create a private workspace or open the one already linked to their email. Then import their website, organise a draft and share their invitation link.</p><PrepareStudioForm /></section>
  </>;
}
