import FresnelMark from '@/components/FresnelMark';
import Link from 'next/link';
import StudioNavLoading from '@/components/StudioNavLoading';
import { LayoutGrid, CalendarDays, Images, Users, Camera, FileText, Globe, ArrowDownToLine, ArrowUpRight, Mail, Palette, ShoppingBag, Instagram, SlidersHorizontal, CircleHelp } from 'lucide-react';
import { switchStudio } from '@/app/studio/settings/team/actions';
import { canEditWebsite, isStudioAdmin, teamRoles, type StudioRole } from '@/lib/studio-access';
import { requireStudio } from '@/lib/supabase';

const groups = [
  ['', [['Overview', '/studio', LayoutGrid], ['Calendar', '/studio/calendar', CalendarDays]]],
  ['Portfolio', [['Projects', '/studio/projects', Images], ['Media', '/studio/media', Images], ['Edit website', '/studio/website', Globe]]],
  ['Production', [['Contacts', '/studio/tools/contacts', Users], ['Equipment', '/studio/tools/equipment', Camera], ['Moodboards', '/studio/tools/moodboards', Palette]]],
  ['Sales', [['Proposals', '/studio/tools/proposals', FileText], ['Invoices', '/studio/tools/invoices', FileText], ['Shop', '/studio/shop', ShoppingBag]]],
  ['Outreach', [['Newsletters', '/studio/tools/newsletters', Mail], ['Social', '/studio/social', Instagram]]],
  ['Studio', [['Import website', '/studio/import', ArrowDownToLine], ['Settings', '/studio/settings', SlidersHorizontal]]],
] as const;

const helpTopics: Record<string, string> = {
  Website: 'website-design', 'Website design': 'website-design', Settings: 'website-design',
  Media: 'media-library', 'Import website': 'import-portfolio', Projects: 'edit-campaign-pages',
  Calendar: 'calendar-and-social', Social: 'calendar-and-social',
};

export default async function StudioShell({ children, active = 'Overview', demo = false, email }: {
  children: React.ReactNode; active?: string; demo?: boolean; email?: string;
}) {
  let role: StudioRole = 'owner';
  let studios: { id: string; name: string }[] = [];
  let studioId = '';
  let name = demo ? 'Rowan Vale' : 'Your studio';
  let publicPath = demo ? '/examples/rowan-vale' : '';
  if (!demo) {
    const session = await requireStudio();
    const { db, workspace } = session;
    role = session.role;
    studioId = workspace.id;
    studios = session.studios;
    const { data } = await db.from('studio_websites').select('draft, published, public_id').eq('workspace_id', workspace.id).maybeSingle();
    name = data?.draft?.name || workspace.name || name;
    if (data?.published) publicPath = '/sites/' + data.public_id;
  }

  return <div className="studio-shell">
    <aside className="studio-sidebar">
      <Link href={demo ? '/demo' : isStudioAdmin(role) ? '/studio/settings' : '/studio'} className="studio-identity">{name}</Link>
      <span className="studio-owner">{demo ? 'Demo studio' : role === 'owner' ? 'Owner' : teamRoles[role]}</span>
      {studios.length > 1 && <form action={switchStudio} className="studio-switcher">
        <label>Switch studio<select name="studio" defaultValue={studioId}>{studios.map(studio =>
          <option key={studio.id} value={studio.id}>{studio.id === studioId ? name : studio.name}</option>
        )}</select></label><button className="secondary-button">Open</button>
      </form>}
      <nav aria-label="Studio navigation">
        {groups.map(([heading, links]) => <div key={heading} className="studio-nav-group">
          {heading && <p className="nav-heading">{heading}</p>}
          {links.filter(([label]) => demo ? !['Calendar', 'Media', 'Edit website', 'Shop', 'Social', 'Settings'].includes(label)
            : isStudioAdmin(role) || ['Overview', 'Projects', 'Media',
              ...(role === 'social' ? ['Social'] : ['Edit website']),
              ...(role === 'assistant' ? ['Calendar'] : []),
              ...(role === 'editor' ? ['Import website'] : [])].includes(label)).map(([label, path, Icon]) => {
            const selected = active === label || (active === 'Website' && label === 'Edit website');
            return <Link key={label} href={demo ? '/demo?view=' + encodeURIComponent(label) : path}
              aria-current={selected ? 'page' : undefined} className={'studio-nav ' + (selected ? 'is-active' : '')}>
              <Icon size={17} />{label}<StudioNavLoading />
            </Link>;
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
        {email && <span>{email}</span>}
        {demo ? <Link href="/login">Private account sign-in ↗</Link> : <form action="/auth/signout" method="post"><button>Sign out</button></form>}
        <Link href="/" className="studio-credit"><FresnelMark /> Fresnel Studios</Link>
      </div>
    </aside>
    <div className="studio-body">
      {demo && <div className="demo-notice">Fictional studio preview · explore freely, no login needed · example content only</div>}
      <main className="studio-main">{children}</main>
    </div>
  </div>;
}
