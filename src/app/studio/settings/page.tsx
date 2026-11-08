import { ActionLink, SubmitButton } from '@/components/ActionFeedback';
import Link from 'next/link';
import StudioShell from '@/components/StudioShell';
import StudioLogoSettings from '@/components/StudioLogoSettings';
import StudioTeamSettings from '@/components/StudioTeamSettings';
import SettingsDesignPanel from '@/components/SettingsDesignPanel';
import WebsiteBuilder from '@/components/WebsiteBuilder';
import { requireStudioAccess } from '@/lib/supabase';
import { normaliseWebsite, preloadWebsiteDraft } from '@/lib/website';
import { portfolioDomainTokens } from '@/lib/studio-domain';
import { saveStudioSettings, takeWebsiteOffline } from './actions';

const messages: Record<string, string> = {
  saved: 'Settings saved.',
  offline: 'Website taken offline. Your draft is saved.',
  changed: 'The active studio changed. Reopen Settings before saving.',
  invalid: 'Check the details you entered and try again.',
  domain: 'Enter a custom hostname such as portfolio.example.com.',
  logo: 'Choose a PNG, JPEG or WebP logo no larger than 256 KB.',
  error: 'Could not save settings. Please try again.',
};

export default async function Settings({ searchParams }: { searchParams: Promise<{ settings?: string }> }) {
  const { db, workspace, user, role } = await requireStudioAccess('admin');
  const id = workspace.id;
  const [site, team, domain, projects, media] = await Promise.all([
    db.from('studio_websites').select('draft,published,public_id').eq('workspace_id', id).maybeSingle(),
    db.from('studio_team').select('email,role,user_id').eq('workspace_id', id).order('created_at'),
    db.from('studio_domains').select('hostname,verification_token').eq('workspace_id', id).maybeSingle(),
    db.from('projects').select('id,title,category,description,image_url,published').eq('workspace_id', id).order('created_at', { ascending: false }),
    db.from('studio_media').select('id,name,source_url,kind,website_selected').eq('workspace_id', id).order('created_at').order('id'),
  ]);
  if (site.error) throw new Error('Settings could not be loaded.');
  const { settings } = await searchParams;
  const draft = normaliseWebsite(site.data?.draft);
  const name = draft.name || workspace.name;
  const live = !!site.data?.published;
  const path = '/sites/' + site.data?.public_id;
  const host = domain.data?.hostname;
  const token = domain.data ? 'fresnel=' + domain.data.verification_token : '';
  const verified = host ? (await portfolioDomainTokens(host)).includes(token) : false;

  return <StudioShell active="Settings" email={user.email}>
    <div className="studio-page-heading"><div><h1>Settings</h1><p>{name}</p></div></div>
    <nav className="settings-links settings-section-links" aria-label="Settings sections">
      <a href="#studio">Studio</a><a href="#design">Design</a><a href="#logo">Logo</a><a href="#domain">Domain</a><a href="#team">Team</a>
    </nav>
    {settings && Object.hasOwn(messages, settings) && <p className="tool-message" role="status">{messages[settings]}</p>}
    <section id="website" className="studio-panel settings-status">
      <div className={live ? 'settings-live' : 'settings-draft'}>
        <div><strong>{live ? '● Your website is live' : 'Your website is a draft'}</strong>
          <p>{live ? <Link href={path} target="_blank" rel="noopener noreferrer">{'www.fresnelstudio.com' + path}</Link> : 'Preview your portfolio and publish it when you’re ready.'}</p>
        </div>
        <ActionLink className="secondary-button" href={live ? path : '/studio/website/preview'} target="_blank" rel="noopener noreferrer">{live ? 'View website ↗' : 'Preview draft ↗'}</ActionLink>
      </div>
      {live && <form action={takeWebsiteOffline.bind(null, id)}><SubmitButton className="settings-text-button">Take the website offline</SubmitButton></form>}
    </section>

    <form id="studio" action={saveStudioSettings.bind(null, id, 'studio')} className="studio-panel studio-setting-form">
      <h2>Studio</h2>
      <label>Portfolio name<input name="name" required maxLength={100} defaultValue={name} /></label>
      <label>Current website<input name="currentWebsite" type="url" defaultValue={draft.currentWebsite} placeholder="https://yourportfolio.com" /></label>
      <SubmitButton className="primary-button">Save studio</SubmitButton>
    </form>

    <SettingsDesignPanel>
      {projects.error || media.error ? <p role="alert">The editor could not load.</p> :
        <WebsiteBuilder key={id} studioId={id} initial={preloadWebsiteDraft(draft, media.data ?? [])} projects={projects.data ?? []} media={media.data ?? []} publicId={site.data?.public_id} isPublished={live} />}
    </SettingsDesignPanel>

    <StudioLogoSettings key={draft.logoSize + ':' + (draft.logo ? 'logo' : 'none')} id={id} name={name} logo={draft.logo} size={draft.logoSize} />

    <section className="studio-panel studio-setting-row">
      <div><h2>Website homepage</h2><p>Set the cover, choose a showreel and put campaigns in order.</p></div>
      <ActionLink className="secondary-button" href="#page-editor">Edit homepage ↗</ActionLink>
    </section>

    <section id="domain" className="studio-panel studio-setting-form settings-wide">
      <h2>Your own domain</h2><p>Use your own address for the published portfolio.</p>
      <div className="settings-columns">
        <form action={saveStudioSettings.bind(null, id, 'domain')}>
          <label>Domain<input name="hostname" defaultValue={host} placeholder="portfolio.example.com" required maxLength={253} /></label>
          <SubmitButton className="primary-button">{host ? 'Save domain' : 'Add domain'}</SubmitButton>
          {host && <> <SubmitButton className="secondary-button" name="intent" value="remove" formNoValidate>Remove domain</SubmitButton></>}
        </form>
        <div><h3>Before you connect</h3><p>Add the domain to the Fresnel Vercel project and follow its DNS instructions. Leave your existing mail records in place. Point the domain here when the portfolio is ready.</p>
          <a href="https://vercel.com/docs/domains/set-up-custom-domain" target="_blank" rel="noopener noreferrer">Vercel setup guide ↗</a>
        </div>
      </div>
      {domain.error && <p role="alert">The domain settings could not load.</p>}
      {host && <div className="settings-domain-record">
        <p><strong>{verified ? 'Ownership TXT record verified' : 'Waiting for ownership TXT record'}</strong></p>
        <p>Add this TXT record in your DNS provider in addition to the records Vercel requests.</p>
        <dl><dt>Name</dt><dd><code>{'_fresnel.' + host}</code></dd><dt>Value</dt><dd><code>{token}</code></dd></dl>
        <form action={saveStudioSettings.bind(null, id, 'domain')} className="settings-domain-recheck"><SubmitButton className="settings-text-button" name="intent" value="recheck">Recheck DNS</SubmitButton></form>
        {verified && live && <> · <a href={'https://' + host} target="_blank" rel="noopener noreferrer">Open custom domain ↗</a></>}
      </div>}
    </section>

    <form id="enquiries" action={saveStudioSettings.bind(null, id, 'enquiries')} className="studio-panel studio-setting-form settings-wide">
      <h2>Website enquiries</h2><p>The contact link on your portfolio opens an email to this address. Publish your site to apply the change.</p>
      <label>Public enquiry email<input name="email" type="email" defaultValue={draft.email} /></label><SubmitButton className="primary-button">Save enquiry email</SubmitButton>
    </form>

    <section className="studio-panel studio-setting-row">
      <div><h2>Newsletters and invoicing</h2><p>Manage mailing-list contacts, newsletter drafts and invoice details in the studio tools.</p></div>
      <div className="settings-links"><Link href="/studio/tools/contacts">Contacts</Link><Link href="/studio/tools/newsletters">Newsletters</Link><Link href="/studio/tools/invoices">Invoices</Link></div>
    </section>

    <StudioTeamSettings id={id} owner={role === 'owner'} email={user.email} members={team.data ?? []} error={!!team.error} />
  </StudioShell>;
}
