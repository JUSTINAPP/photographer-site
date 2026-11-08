import { ActionLink } from '@/components/ActionFeedback';
import { isStudioAdmin } from '@/lib/studio-access';
import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import { requireStudio } from '@/lib/supabase';
import { addDays, dayKey } from '@/lib/studio-planner';

export default async function Studio() {
  const { db, workspace, user, role } = await requireStudio();
  if (!isStudioAdmin(role)) return <StudioShell email={user.email}>
    <div className="studio-page-heading"><div><h1>Shared portfolio</h1><p>Review the site, projects and media in this studio.</p></div></div>
    <ActionLink className="primary-button" href={role === 'social' ? '/studio/social' : '/studio/website'}>{role === 'social' ? 'Open social scheduler' : role === 'editor' ? 'Open website editor' : 'Open website preview'} ↗</ActionLink>
  </StudioShell>;
  const today = dayKey(new Date());
  const [projects, photos, videos, scheduled, upcoming] = await Promise.all([
    db.from('projects').select('id', { count: 'exact', head: true }).eq('workspace_id', workspace.id),
    db.from('studio_media').select('id', { count: 'exact', head: true }).eq('workspace_id', workspace.id).eq('kind', 'photo'),
    db.from('studio_media').select('id', { count: 'exact', head: true }).eq('workspace_id', workspace.id).eq('kind', 'video'),
    db.from('studio_schedule').select('id', { count: 'exact', head: true }).eq('workspace_id', workspace.id).eq('status', 'scheduled').gte('day', today),
    db.from('studio_schedule').select('id,kind,title,day,local_time,category').eq('workspace_id', workspace.id).in('status', ['planned', 'scheduled'])
      .gte('day', today).lte('day', addDays(today, 13)).order('day').order('local_time').limit(8),
  ]);
  return <StudioShell email={user.email}>
    <div className="studio-page-heading">
      <div><h1>Overview</h1><p>{new Intl.DateTimeFormat('en-AU', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date())}</p></div>
      <ActionLink className="secondary-button" href="/studio/website">Open design editor ↗</ActionLink>
    </div>
    <div className="studio-metrics">
      {([
        ['Portfolio projects', projects.count, '/studio/projects'],
        ['Photos', photos.count, '/studio/media'],
        ['Videos', videos.count, '/studio/media'],
        ['Scheduled posts', scheduled.count, '/studio/social'],
      ] as const).map(([label, count, path]) => <Link className="studio-panel" href={path} key={label}><span>{label}</span><strong>{count ?? '—'}</strong></Link>)}
    </div>
    <div className="workspace-grid">
      <section className="studio-panel">
        <div className="panel-heading"><h2>Website design</h2><Link href="/studio/website">Open editor ↗</Link></div>
        <p>Choose a look, adjust your design and preview the website on desktop or mobile.</p>
        <p><Link href="/studio/import">Import your existing portfolio ↗</Link></p>
      </section>
      <section className="studio-panel">
        <div className="panel-heading"><h2>Coming up</h2><Link href="/studio/calendar">Calendar ↗</Link></div>
        {upcoming.error ? <p>The schedule could not load.</p> : upcoming.data?.length ? upcoming.data.map(item =>
          <Link className="planner-chip" key={item.id} href={(item.kind === 'social' ? '/studio/social' : '/studio/calendar') + '?d=' + item.day + '&edit=' + item.id + '#planner-editor'}>
            <small>{item.day} {item.local_time?.slice(0, 5)} · {item.category}</small><strong>{item.title}</strong>
          </Link>) : <p>Nothing planned in the next 14 days.</p>}
      </section>
    </div>
  </StudioShell>;
}
