import { SubmitButton } from '@/components/ActionFeedback';
import FresnelMark from '@/components/FresnelMark';
import Link from 'next/link';
import StudioNavLoading from '@/components/StudioNavLoading';
import { LayoutGrid, CalendarDays, Images, Users, Camera, FileText, Globe, ArrowDownToLine, ArrowUpRight, Mail, Palette, ShoppingBag, Instagram, SlidersHorizontal, CircleHelp, Lightbulb, Megaphone, BarChart3, Search, MapPin, Target, TrendingUp, Star, FolderOpen, Sparkles } from 'lucide-react';
import { endSupport } from '@/app/admin/actions';
import { switchStudio } from '@/app/studio/settings/team/actions';
import { canEditWebsite, isStudioAdmin, teamRoles, type StudioRole } from '@/lib/studio-access';
import IntentLink from '@/components/IntentLink';
import { requireStudio, studioBrand } from '@/lib/supabase';

const groups = [
  ['', [['Overview', '/studio', LayoutGrid], ['Calendar', '/studio/calendar', CalendarDays]]],
  ['Portfolio', [['Projects', '/studio/projects', Images], ['Media', '/studio/media', Images], ['Edit website', '/studio/website', Globe]]],
  ['Production', [['Contacts', '/studio/tools/contacts', Users], ['Equipment', '/studio/tools/equipment', Camera], ['Moodboards', '/studio/tools/moodboards', Palette]]],
  ['Sales', [['Proposals', '/studio/tools/proposals', FileText], ['Invoices', '/studio/tools/invoices', FileText], ['Shop', '/studio/shop', ShoppingBag]]],
  ['Social Calendar', [['Social calendar', '/studio/social', CalendarDays], ['Ideas', '/studio/social/ideas', Lightbulb], ["What’s on", '/studio/social/whats-on', Megaphone], ['Guidelines', '/studio/social/guidelines', Palette], ['Content', '/studio/social/content', FolderOpen], ['Analytics', '/studio/social/analytics', BarChart3]]],
  ['Marketing', [['Campaigns', '/studio/marketing/campaigns', Mail], ['Search & Visibility', '/studio/marketing/search-console', Search], ['Google Business', '/studio/marketing/google-business', MapPin], ['Google Ads', '/studio/marketing/google-ads', Target], ['Website Analytics', '/studio/marketing/website-analytics', TrendingUp], ['Reviews', '/studio/marketing/reviews', Star]]],
  ['Studio', [['Import website', '/studio/import', ArrowDownToLine], ['Settings', '/studio/settings', SlidersHorizontal], ['Site speed', '/studio/performance', TrendingUp]]],
] as const;

const helpTopics: Record<string, string> = {
  Website: 'website-design', 'Website design': 'website-design', Settings: 'website-design',
  Media: 'media-library', 'Import website': 'import-portfolio', Projects: 'edit-campaign-pages',
  Calendar: 'calendar-and-social', Social: 'calendar-and-social',
};

export default async function StudioShell({ children, active = 'Overview', demo = false, email }: {
  children: React.ReactNode; active?: string; demo?: boolean; email?: string;
}) {
  let platformAdmin = false;
  let support: { reason: string; ends_at: string } | null = null;
  let role: StudioRole = 'owner';
  let studios: { id: string; name: string }[] = [];
  let studioId = '';
  let name = demo ? 'Rowan Vale' : 'Your studio';
  let publicPath = demo ? '/examples/rowan-vale' : '';
  if (!demo) {
    const session = await requireStudio();
    const { db, workspace } = session;
    role = session.role;
    platformAdmin = session.platformAdmin;
    const [brand, activeSupport] = await Promise.all([
      studioBrand(workspace.id),
      platformAdmin ? db.from('platform_support_sessions').select('reason,ends_at')
        .eq('workspace_id', workspace.id).eq('admin_id', session.user.id).is('ended_at', null)
        .gt('ends_at', new Date().toISOString()).order('started_at', { ascending: false }).limit(1).maybeSingle() : null,
    ]);
    support = activeSupport?.data ?? null;
    studioId = workspace.id;
    studios = session.studios;
    name = brand.data?.draft_name || workspace.name || name;
    if (brand.data?.published_name !== null && brand.data?.published_name !== undefined) publicPath = '/sites/' + brand.data.public_id;
  }

  return <div className="studio-shell">
    <aside className="studio-sidebar">
      <Link href={demo ? '/demo' : isStudioAdmin(role) ? '/studio/settings' : '/studio'} className="studio-identity">{name}</Link>
      <span className="studio-owner">{demo ? 'Demo studio' : role === 'owner' ? 'Owner' : teamRoles[role]}</span>
      {studios.length > 1 && <form action={switchStudio} className="studio-switcher">
        <label>Switch studio<select name="studio" defaultValue={studioId}>{studios.map(studio =>
          <option key={studio.id} value={studio.id}>{studio.id === studioId ? name : studio.name}</option>
        )}</select></label><SubmitButton className="secondary-button">Open</SubmitButton>
      </form>}
      <nav aria-label="Studio navigation">
        {groups.map(([heading, links]) => <div key={heading} className={"studio-nav-group" + (["Social Calendar","Marketing"].includes(heading)?" growth-nav-group":"")}>
          {heading && <p className="nav-heading">{heading}</p>}
          {links.filter(([label]) => demo ? !['Calendar', 'Media', 'Edit website', 'Shop', 'Social', 'Settings'].includes(label)
            : isStudioAdmin(role) || ['Overview', 'Projects', 'Media',
              ...(role === 'social' ? ['Social calendar', 'Ideas', 'What’s on', 'Guidelines', 'Content', 'Analytics', 'Search & Visibility', 'Google Business', 'Google Ads', 'Website Analytics', 'Reviews'] : ['Edit website']),
              ...(role === 'assistant' ? ['Calendar'] : []),
              ...(role === 'editor' ? ['Import website'] : [])].includes(label)).map(([label, path, Icon]) => {
            const selected = active === label || (path.startsWith('/studio/social/') && active === 'Social '+path.split('/').pop()) || (path.startsWith('/studio/marketing/') && active === 'Marketing '+path.split('/').pop()) || (active === 'Website' && label === 'Edit website');
            return <IntentLink key={label} href={demo ? '/demo?view=' + encodeURIComponent(label) : path}
              aria-current={selected ? 'page' : undefined} className={'studio-nav ' + (selected ? 'is-active' : '')}>
              <Icon size={17} />{label}<StudioNavLoading />
            </IntentLink>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-bottom studio-sidebar-footer">
        {role !== 'social' && <div className="studio-website-shortcuts" role="group" aria-label="Portfolio website">
          {publicPath ? (
            <Link href={publicPath} target="_blank" rel="noopener noreferrer" aria-label={demo ? 'Open example website in a new tab' : 'Open live website in a new tab'}>
              <span className="studio-website-dot is-live" aria-hidden="true" />{demo ? 'Example website' : 'Website live'}<ArrowUpRight size={14} />
            </Link>
          ) : (
            <Link href="/studio/website/preview" target="_blank" rel="noopener noreferrer" aria-label="Open your saved draft in a new tab">
              <span className="studio-website-dot" aria-hidden="true" />Preview draft<ArrowUpRight size={14} />
            </Link>
          )}
          {!demo && <Link href={isStudioAdmin(role) ? '/studio/settings#design' : '/studio/website'} className="studio-website-design">{canEditWebsite(role) ? 'Design' : 'Preview'}<StudioNavLoading /></Link>}
        </div>}
        <Link className="studio-help-link" href={helpTopics[active] ? '/help/' + helpTopics[active] : '/help'} target="_blank" rel="noopener noreferrer">
          <CircleHelp size={16} />{helpTopics[active] ? 'Help with this page' : 'Help centre'}
        </Link>
        {platformAdmin && <Link className="studio-help-link" href="/admin">Fresnel master admin →</Link>}
        {email && <span>{email}</span>}
        {demo ? <Link href="/login">Private account sign-in ↗</Link> : <form action="/auth/signout" method="post"><button>Sign out</button></form>}
        <Link href="/" className="studio-credit"><FresnelMark /> Fresnel Studios</Link>
      </div>
    </aside>
    <div className="studio-body">
      {demo && <div className="demo-notice">Fictional studio preview · explore freely, no login needed · example content only</div>}
      {support && <div className="platform-support-banner">
        <div><strong>Fresnel support · {name}</strong><span>{support.reason} · access ends {new Date(support.ends_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Sydney' })} Sydney time</span></div>
        <form action={endSupport}><SubmitButton className="secondary-button">Finish support & return to Admin</SubmitButton></form>
      </div>}
      <main className="studio-main">{children}</main>
    </div>
  </div>;
}
