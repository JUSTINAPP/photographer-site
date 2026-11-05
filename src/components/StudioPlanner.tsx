import Link from 'next/link';
import StudioShell from './StudioShell';
import { requireStudioAccess } from '@/lib/supabase';
import { addDays, dayKey, eventTypes, mondayOf, socialChannels, validDay } from '@/lib/studio-planner';
import { changeSchedule } from '@/app/studio/calendar/actions';

type Entry = {
  id: string; kind: 'event' | 'social'; title: string; day: string | null; local_time: string | null;
  notes: string; category: string; status: string; media_id: string | null;
};
export type PlannerParams = { d?: string; view?: string; edit?: string; day?: string };

export default async function StudioPlanner({ social = false, params }: { social?: boolean; params: PlannerParams }) {
  const { db, user, workspace } = await requireStudioAccess(social ? 'social' : 'calendar');
  const path = social ? '/studio/social' : '/studio/calendar';
  const kind = social ? 'social' : 'event';
  const today = dayKey(new Date());
  const date = params.d && validDay(params.d) ? params.d : today;
  const month = date.slice(0, 7) + '-01';
  const view = params.view === 'week' || params.view === 'list' ? params.view : 'month';
  const first = mondayOf(view === 'week' ? date : month);
  const days = Array.from({ length: view === 'week' ? 7 : 42 }, (_, index) => addDays(first, index));
  const nextMonth = addDays(month, 32).slice(0, 7) + '-01';
  const previousMonth = addDays(month, -1).slice(0, 7) + '-01';
  const base = path + '?view=' + view + '&d=' + date;
  const [schedule, drafts, selected, media] = await Promise.all([
    db.from('studio_schedule').select('*').eq('workspace_id', workspace.id)
      .in('kind', social ? ['social'] : ['event', 'social'])
      .gte('day', first).lte('day', days[days.length - 1]).order('day').order('local_time'),
    social ? db.from('studio_schedule').select('*').eq('workspace_id', workspace.id).eq('kind', kind).is('day', null).order('title') : null,
    params.edit && /^[a-f0-9-]{36}$/i.test(params.edit) ? db.from('studio_schedule').select('*').eq('workspace_id', workspace.id).eq('kind', kind).eq('id', params.edit).maybeSingle() : null,
    social ? db.from('studio_media').select('id,name').eq('workspace_id', workspace.id).order('name') : null,
  ]);
  if (schedule.error || drafts?.error || selected?.error || media?.error) throw new Error('The planner could not be loaded.');
  const current = selected?.data as Entry | undefined;
  const entries = (schedule.data ?? []) as Entry[];
  const undated = (drafts?.data ?? []) as Entry[];
  const categories = social ? socialChannels : eventTypes;
  function entryLink(entry: Entry) {
    const target = entry.kind === 'social' ? '/studio/social' : '/studio/calendar';
    return <Link key={entry.id} className={'planner-chip ' + entry.status} href={target + '?view=' + view + '&d=' + date + '&edit=' + entry.id + '#planner-editor'}>
      <small>{entry.local_time?.slice(0, 5)} {entry.category}{entry.kind === 'social' && ' · ' + entry.status}</small>
      <strong>{entry.title}</strong>
    </Link>;
  }

  return <StudioShell active={social ? 'Social' : 'Calendar'} email={user.email}>
    <div className="studio-page-heading"><div><h1>{social ? 'Social scheduler' : 'Production calendar'}</h1>
      <p>{social ? 'Plan captions and media, schedule a local posting time, and mark posts published after posting.' : 'See shoots, meetings, deliveries and planned social posts together.'}</p></div>
      <Link className="primary-button" href={base + '#planner-editor'}>{social ? 'New post' : 'Add event'}</Link>
    </div>
    <div className="planner-toolbar">
      <div className="design-switch" aria-label="Calendar view">{['month', 'week', 'list'].map(option => <Link key={option} aria-current={view === option ? 'page' : undefined} href={path + '?view=' + option + '&d=' + date}>{option}</Link>)}</div>
      <div className="planner-period">
        <Link aria-label="Previous period" href={path + '?view=' + view + '&d=' + (view === 'week' ? addDays(date, -7) : previousMonth)}>←</Link>
        <strong>{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC', ...(view === 'week' ? { day: 'numeric' } : {}) }).format(new Date(view === 'week' ? first : month))}</strong>
        <Link aria-label="Next period" href={path + '?view=' + view + '&d=' + (view === 'week' ? addDays(date, 7) : nextMonth)}>→</Link>
        <Link href={path + '?view=' + view}>Today</Link>
      </div>
    </div>
    {view === 'list' ? <section className="studio-panel planner-list">
      {entries.filter(entry => entry.day?.startsWith(month.slice(0, 7))).map(entry => <div key={entry.id}><time>{entry.day}</time>{entryLink(entry)}</div>)}
      {!entries.some(entry => entry.day?.startsWith(month.slice(0, 7))) && <p>Nothing on the calendar this month.</p>}
    </section> : <div className="planner-scroll"><div className="planner-grid">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => <div key={label} className="planner-day-label">{label}</div>)}
      {days.map(day => <div key={day} className={'planner-day' + (day === today ? ' today' : '') + (!day.startsWith(month.slice(0, 7)) && view === 'month' ? ' outside' : '')}>
        <Link href={base + '&day=' + day + '#planner-editor'} aria-label={'Add item on ' + day}>{Number(day.slice(-2))} <span>+</span></Link>
        {entries.filter(entry => entry.day === day).map(entryLink)}
      </div>)}
    </div></div>}
    {undated.length > 0 && <section className="studio-panel planner-list"><h2>Unscheduled posts</h2>{undated.map(entryLink)}</section>}
    <section id="planner-editor" className="studio-panel studio-setting-form">
      <h2>{current ? 'Edit ' : 'New '}{social ? 'post' : 'event'}</h2>
      {social && <p>Posting is manual. The schedule records the time you plan to post.</p>}
      <form key={current?.id ?? params.day ?? 'new'} action={changeSchedule.bind(null, kind)}>
        {current && <input type="hidden" name="id" value={current.id} />}
        <label>Title<input name="title" required maxLength={150} defaultValue={current?.title} /></label>
        <label>{social ? 'Channel' : 'Type'}<select name="category" defaultValue={current?.category}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
        <div className="planner-fields">
          <label>Date<input name="day" type="date" min="2000-01-01" required={!social} defaultValue={current ? current.day ?? '' : params.day && validDay(params.day) ? params.day : social ? '' : date} /></label>
          <label>Local time<input name="local_time" type="time" defaultValue={current?.local_time?.slice(0, 5)} /></label>
        </div>
        <label>{social ? 'Caption' : 'Notes'}<textarea name="notes" rows={4} maxLength={3000} defaultValue={current?.notes} /></label>
        {social && <>
          <label>Media<select name="media_id" defaultValue={current?.media_id ?? ''}><option value="">Choose later</option>{media?.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Status<select name="status" defaultValue={current?.status ?? 'draft'}><option value="draft">Draft</option><option value="scheduled">Scheduled for manual posting</option><option value="posted">Posted</option></select></label>
        </>}
        <button className="primary-button">Save {social ? 'post' : 'event'}</button>
        {current && <> <Link className="secondary-button" href={base + '#planner-editor'}>Cancel</Link> <button className="secondary-button" name="intent" value="delete" formNoValidate>Delete</button></>}
      </form>
    </section>
  </StudioShell>;
}
