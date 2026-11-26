'use client';
import type { Website } from '@/lib/website';
import {EditableRegion} from './WebsiteEditing';
import InlineWebsiteText from './InlineWebsiteText';
export type AboutTextField = 'aboutLabel' | 'aboutTitle' | 'about' | 'clientsHeading' | 'clients' | 'servicesLabel' | 'servicesHeading' | 'services';
export type AboutTextChange = (field: AboutTextField, text: string) => void;
export default function WebsiteAboutContent({ site, illustrative = false, onChange }: { site: Website; illustrative?: boolean; onChange?: AboutTextChange }) {
  const edit = (field: AboutTextField) => onChange ? (text: string) => onChange(field, text) : undefined;
  return <>
    <EditableRegion site={site} id="about:biography"><section className="campaign-about campaign-copy">
      <div><InlineWebsiteText className="campaign-kicker" value={site.aboutLabel} label="About section label" maxLength={100} onChange={edit('aboutLabel')} />
        <InlineWebsiteText as="h1" value={site.aboutTitle || site.name || 'Your studio'} label="About page title" maxLength={140} onChange={edit('aboutTitle')} />
        <InlineWebsiteText value={site.about || (illustrative && !onChange ? 'An independent photography and film practice working across fashion, coastal life and commercial campaigns.' : '')} label="About biography" multiline onChange={edit('about')} placeholder="Click to write your biography" /></div>
      {(site.clients || illustrative || onChange) && <aside>
        <InlineWebsiteText as="h2" value={site.clientsHeading} label="Clients heading" maxLength={100} onChange={edit('clientsHeading')} />
        {onChange ? <InlineWebsiteText className="inline-client-list" value={site.clients} label="Client names, one per line" multiline maxLength={2000} onChange={edit('clients')} placeholder="Click to add clients, one per line" /> : <ul>{(site.clients || 'Client name 01\nClient name 02\nClient name 03').split('\n').map((client, i) => client.trim() && <li key={i}>{client.trim()}</li>)}</ul>}
      </aside>}
    </section></EditableRegion>
    {(site.services || site.servicesHeading || onChange) && <EditableRegion site={site} id="about:services"><section className="campaign-services campaign-copy">
      <InlineWebsiteText className="campaign-kicker" value={site.servicesLabel} label="Services section label" maxLength={100} onChange={edit('servicesLabel')} />
      <InlineWebsiteText as="h2" value={site.servicesHeading} label="Services heading" maxLength={140} onChange={edit('servicesHeading')} />
      <InlineWebsiteText value={site.services || (illustrative && !onChange ? 'Campaign photography\nEditorial photography\nMotion and short-form film\nCreative direction' : '')} label="Services description" multiline maxLength={1500} onChange={edit('services')} placeholder="Click to list your services" />
    </section></EditableRegion>}
  </>;
}
