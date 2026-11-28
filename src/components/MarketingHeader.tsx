'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { ActionLink } from './ActionFeedback';
import FresnelMark from './FresnelMark';
const menus = {
  Websites: [
    {title:'BUILD YOUR WEBSITE',links:[{name:'Website builder',copy:'Design your photography website.',href:'/signup/start'},{name:'Bring your current site',copy:'Review and reuse imported work.',href:'/signup/start?method=import'},{name:'Design & typography',copy:'Your name, type and page layouts.',href:'/#design'}]},
    {title:'SHOW YOUR WORK',links:[{name:'Campaign galleries',copy:'Connect a cover to the complete story.',href:'/#galleries'},{name:'Video openings',copy:'Turn selected shots into a short edit.',href:'/#motion'},{name:'Example portfolio',copy:'Explore stills and motion in context.',href:'/examples/rowan-vale'}]},
    {title:'MAKE IT YOURS',links:[{name:'Drafts & publishing',copy:'Review privately before going live.',href:'/#publishing'},{name:'Website pricing',copy:'Simple plans for your photography website.',href:'/pricing'}]}
  ],
  'Studio tools': [
    {title:'PLAN & PRESENT',links:[{name:'Moodboards',copy:'Reference images, briefs and PDF layouts.',href:'/demo?view=Moodboards'},{name:'Proposals',copy:'Prepare scope, fees and usage drafts.',href:'/demo?view=Proposals'},{name:'Contacts',copy:'Keep clients and crew together.',href:'/demo?view=Contacts'}]},
    {title:'ORGANISE YOUR STUDIO',links:[{name:'Invoices',copy:'Create drafts and record payments.',href:'/demo?view=Invoices'},{name:'Equipment',copy:'Track kit, locations and maintenance.',href:'/demo?view=Equipment'},{name:'Newsletters',copy:'Compose and export a newsletter draft.',href:'/demo?view=Newsletters'}]},
    {title:'EXPLORE',links:[{name:'Studio tour',copy:'Try the tools without an account.',href:'/demo'},{name:'What is available?',copy:'Current tools and planned connections.',href:'/#faq'}]}
  ],
  Resources: [
    {title:'GET STARTED',links:[{name:'Help centre',copy:'Guides for your website and studio.',href:'/help'},{name:'Example website',copy:'See a photography portfolio in action.',href:'/examples/rowan-vale'}]},
    {title:'SUPPORT',links:[{name:'Contact Fresnel',copy:'Get help with your next step.',href:'/support'},{name:'Trust & privacy',copy:'How your work and account are handled.',href:'/trust'}]}
  ]
};
type MenuName = keyof typeof menus;
export default function MarketingHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled,setScrolled]=useState(false),[open,setOpen]=useState(false),[active,setActive]=useState<MenuName|null>(null);
  const root=useRef<HTMLElement>(null);const trigger=useRef<HTMLButtonElement|null>(null);
  const close=()=>{setOpen(false);setActive(null)};
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>32);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)},[]);
  useEffect(()=>{if(!open&&!active)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))close()};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){close();trigger.current?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[open,active]);
  return <header ref={root} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget as Node))close()}} className={`mk-header mk-header-modern${overlay?' mk-header-overlay':''}${scrolled?' is-scrolled':''}${open?' menu-open':''}${active?' has-dropdown':''}`}>
    <Link className="mk-logo" href="/" aria-label="Fresnel Studio home"><FresnelMark/>Fresnel Studio</Link>
    <nav id="marketing-navigation" aria-label="Main navigation">
      {(Object.keys(menus) as MenuName[]).map(name=><div className="mk-nav-group" key={name}>
        <button className="mk-nav-trigger" aria-expanded={active===name} aria-controls={`menu-${name.replaceAll(' ','-')}`} onClick={e=>{trigger.current=e.currentTarget;setActive(active===name?null:name)}}>{name}<ChevronDown size={14}/></button>
        <div id={`menu-${name.replaceAll(' ','-')}`} className={`mk-mega${active===name?' is-open':''}`} inert={active!==name} aria-hidden={active!==name}>
          <div className="mk-mega-inner">{menus[name].map(group=><div className="mk-mega-column" key={group.title}><p>{group.title}</p>{group.links.map(link=><Link href={link.href} key={link.name} onClick={close}><strong>{link.name}<ArrowUpRight size={15}/></strong><span>{link.copy}</span></Link>)}</div>)}<div className="mk-mega-note"><span>{name==='Websites'?'A WEBSITE BUILT AROUND YOUR PHOTOGRAPHY':name==='Studio tools'?'YOUR WEBSITE FIRST. USEFUL TOOLS BEHIND IT.':'A LITTLE GUIDANCE GOES A LONG WAY.'}</span><Link href={name==='Studio tools'?'/demo':'/signup/start'} onClick={close}>{name==='Studio tools'?'Explore the studio':'Start building'} <ArrowUpRight size={17}/></Link></div></div>
        </div>
      </div>)}
      <Link href="/pricing" onClick={close}>Pricing</Link><Link href="/login" onClick={close}>Sign in</Link><ActionLink href="/signup/start" className="mk-nav-cta" onClick={close}>Start building <ArrowUpRight size={14}/></ActionLink>
    </nav>
    <button className="mk-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="marketing-navigation" onClick={e=>{trigger.current=e.currentTarget;if(open)close();else setOpen(true)}}>{open?<X size={22}/>:<Menu size={22}/>}</button>
  </header>
}
