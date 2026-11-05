import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import { requireStudioAccess } from '@/lib/supabase';
import { normaliseWebsite } from '@/lib/website';
import { savePortfolioName } from './actions';

export default async function Settings() {
  const { db, workspace, user } = await requireStudioAccess('owner');
  const { data, error } = await db.from('studio_websites').select('draft,published,public_id').eq('workspace_id', workspace.id).maybeSingle();
  if (error) throw new Error('Settings could not be loaded.');
  const draft = normaliseWebsite(data?.draft);
  return <StudioShell active="Settings" email={user.email}>
    <div className="studio-page-heading"><div><h1>Settings</h1><p>{draft.name || workspace.name}</p></div></div>
    <section className="studio-panel studio-setting-row">
      <div><h2>{data?.published ? 'Your website is live' : 'Your website is a draft'}</h2><p>Save your design as a draft or publish it from the editor.</p></div>
      {data?.published && <Link className="secondary-button" href={'/sites/' + data.public_id}>View website ↗</Link>}
    </section>
    <section className="studio-panel studio-setting-row">
      <div><h2>Team</h2><p>Invite people to work on this studio’s portfolio and manage their access.</p></div>
      <Link className="secondary-button" href="/studio/settings/team">Manage team ↗</Link>
    </section>
    <form action={savePortfolioName} className="studio-panel studio-setting-form">
      <h2>Studio name</h2>
      <label>Portfolio name<input name="name" required maxLength={100} defaultValue={draft.name || workspace.name} /></label>
      <button className="primary-button">Save name</button>
    </form>
    <section className="studio-panel studio-setting-row">
      <div><h2>Website design</h2><p>Choose a template and adjust the type, colours, header and opening layout with a live preview.</p></div>
      <Link className="primary-button" href="/studio/website">Open the design editor</Link>
    </section>
  </StudioShell>;
}
