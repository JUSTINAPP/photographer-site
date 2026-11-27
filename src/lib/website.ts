import {cleanSavedLooks} from './design-agent';
import {normaliseMotion} from './home-motion';
import { portfolioCollections } from './portfolio-collections';
import { vimeoEmbed } from './import-identity';
import type { WebsiteSection } from './website-sections';
import { normaliseTheme, PRESETS } from './website-theme';

export const editorialTheme = normaliseTheme(PRESETS.editorial.theme);

export function websiteImage(value: string) {
  if (!value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

export type GalleryImage = { url: string; size: 'grid' | 'wide' | 'screen'; alt: string; link?: string };
export type WebsiteMedia = { id: string; name: string; source_url: string; kind: 'photo' | 'video'; website_selected: boolean };

const projectId = /^[a-f0-9-]{36}$/i;

export function orderWebsiteProjects(projects: WebsiteProject[], order: string[]) {
  const positions = new Map(order.map((id, index) => [id, index]));
  return [...projects].sort((a, b) => (positions.get(a.id) ?? Infinity) - (positions.get(b.id) ?? Infinity));
}

export function normaliseWebsite(input: unknown) {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const field = (key: string, length: number) =>
    typeof data[key] === 'string' ? data[key].trim().slice(0, length) : '';
  const email = field('email', 254);
  const logo = field('logo', 350000);
  const cleanLogo=(key:string)=>{const value=field(key,350000);return /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(value)?value:'';};
  const logoSize = typeof data.logoSize === 'number' && Number.isFinite(data.logoSize) ? Math.round(Math.max(24, Math.min(120, data.logoSize))) : 44;
  const galleries: Record<string, string> = {};
  if (data.galleries && typeof data.galleries === 'object') {
    for (const [id, images] of Object.entries(data.galleries).slice(0, 150)) {
      if (/^[a-f0-9-]{36}$/i.test(id) && typeof images === 'string') {
        const urls = images.slice(0, 24000).split(/\r?\n/).map(websiteImage).filter(Boolean).slice(0, 12);
        if (urls.length) galleries[id] = urls.join('\n');
      }
    }
  }
  function cleanFrames(items: unknown, limit: number): GalleryImage[] | null {
    if (!Array.isArray(items)) return null;
    return items.slice(0, limit).flatMap(item => {
      const url = typeof item?.url === 'string' ? websiteImage(item.url.slice(0, 2048)) : '';
      const size: GalleryImage['size'] = item?.size === 'wide' || item?.size === 'screen' ? item.size : 'grid';
      return url ? [{ url, size, alt: typeof item.alt === 'string' ? item.alt.slice(0, 220) : '', ...(typeof item.link === 'string' && projectId.test(item.link) ? { link: item.link } : {}) }] : [];
    });
  }
  const placements: Record<string, GalleryImage[]> = {};
  if (data.placements && typeof data.placements === 'object') {
    for (const [id, items] of Object.entries(data.placements).slice(0, 150)) {
      const frames = projectId.test(id) ? cleanFrames(items, 100) : null;
      if (frames) placements[id] = frames;
    }
  }
  const covers: Record<string, string> = {};
  if (data.covers && typeof data.covers === 'object') {
    for (const [id, url] of Object.entries(data.covers).slice(0, 150)) {
      if (projectId.test(id) && typeof url === 'string') {
        const safe = websiteImage(url.slice(0, 2048));
        if (safe) covers[id] = safe;
      }
    }
  }
  const projectOrder = Array.isArray(data.projectOrder)
    ? [...new Set(data.projectOrder.filter((id): id is string => typeof id === 'string' && projectId.test(id)).slice(0, 150))]
    : [];
  const sections: Record<string, WebsiteSection[]> = {};
  if (data.sections && typeof data.sections === 'object') {
    for (const [page, blocks] of Object.entries(data.sections).slice(0, 152)) {
      if ((page !== 'home' && page !== 'about' && !projectId.test(page)) || !Array.isArray(blocks)) continue;
      const seen = new Set<string>();
      sections[page] = blocks.slice(0, 24).flatMap(block => {
        if (!block || typeof block.id !== 'string' || !projectId.test(block.id) || seen.has(block.id)) return [];
        seen.add(block.id);
        const get = (key: string, max: number) => typeof block[key] === 'string' ? block[key].trim().slice(0, max) : '';
        const layout: WebsiteSection['layout'] = block.layout === 'split' || block.layout === 'text' ? block.layout : 'full';
        const link = get('link', 36);
        return [{ id: block.id, layout, heading: get('heading', 140), text: get('text', 1800),
          image: websiteImage(get('image', 2048)), alt: get('alt', 220), link: projectId.test(link) ? link : '' }];
      });
    }
  }
  const related: Record<string, string[]> = {};
  if (data.related && typeof data.related === 'object') {
    for (const [page, items] of Object.entries(data.related).slice(0, 150)) {
      if (!projectId.test(page) || !Array.isArray(items)) continue;
      related[page] = [...new Set(items.filter(id => typeof id === 'string' && projectId.test(id) && id !== page))].slice(0, 12);
    }
  }
  const collections: Record<string, string> = {};
  const films: Record<string, string> = {};
  if (data.collections && typeof data.collections === 'object') {
    for (const [id, name] of Object.entries(data.collections).slice(0, 150)) {
      if (projectId.test(id) && typeof name === 'string' && portfolioCollections.some(collection => collection.name === name)) collections[id] = name;
    }
  }
  if (data.films && typeof data.films === 'object') {
    for (const [id, input] of Object.entries(data.films).slice(0, 150)) {
      const film = projectId.test(id) && typeof input === 'string' ? vimeoEmbed(input.slice(0, 2048)) : null;
      if (film) films[id] = film;
    }
  }
  const navigation: {label:string;page:string;href:string}[] = Array.isArray(data.navigation) ? data.navigation.slice(0,30).flatMap(item=> {
    if(!item || typeof item.label!=='string')return [];
    const page=typeof item.page==='string' && (['home','about','contact'].includes(item.page)||projectId.test(item.page))?item.page:'';
    const href=typeof item.href==='string'?(item.href.startsWith('mailto:')&&/^[^\s<>]+$/.test(item.href)?item.href:websiteImage(item.href)):'';
    return page||href?[{label:item.label.slice(0,80),page,href}]:[];
  }) : [];
  const hiddenBlocks=Array.isArray(data.hiddenBlocks)?data.hiddenBlocks.filter((key):key is string=>typeof key==='string'&&/^[a-zA-Z0-9:-]{1,100}$/.test(key)).slice(0,200):[];
  const blockStyles:Record<string,{heading?:number;body?:number}>={};
  if(data.blockStyles&&typeof data.blockStyles==='object')for(const [key,value] of Object.entries(data.blockStyles).slice(0,200)){
    if(!/^[a-zA-Z0-9:-]{1,100}$/.test(key)||!value||typeof value!=='object')continue;
    const sizes=value as Record<string,unknown>;const size=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.round(Math.max(0,Math.min(120,v))):0;
    blockStyles[key]={heading:size(sizes.heading),body:size(sizes.body)};
  }
  const pageCopy:Record<string,{title?:string;category?:string;description?:string}>={};
  if(data.pageCopy&&typeof data.pageCopy==='object')for(const [id,value] of Object.entries(data.pageCopy).slice(0,150)){
    if(!projectId.test(id)||!value||typeof value!=='object')continue;
    const copy=value as Record<string,unknown>;pageCopy[id]=Object.fromEntries(['title','category','description'].flatMap(key=>typeof copy[key]==='string'?[[key,(copy[key] as string).slice(0,key==='description'?2000:180)]]:[]));
  }
  const filmGalleries:Record<string,string[]>={};
  if(data.filmGalleries&&typeof data.filmGalleries==='object')for(const [id,items] of Object.entries(data.filmGalleries).slice(0,150))if(projectId.test(id)&&Array.isArray(items))filmGalleries[id]=[...new Set(items.slice(0,30).flatMap(url=>typeof url==='string'&&websiteImage(url)?[vimeoEmbed(url)||websiteImage(url)]:[]))];
  const galleryLayouts:Record<string,'grid'|'natural'>={};
  if(data.galleryLayouts&&typeof data.galleryLayouts==='object')for(const [id,value] of Object.entries(data.galleryLayouts).slice(0,150))if((id==='home'||projectId.test(id))&&(value==='grid'||value==='natural'))galleryLayouts[id]=value;
  const pageMotion:Record<string,ReturnType<typeof normaliseMotion>>={};
  if(data.pageMotion&&typeof data.pageMotion==='object')for(const [id,value] of Object.entries(data.pageMotion).slice(0,150))if(projectId.test(id)){const motion=normaliseMotion(value);pageMotion[id]={...motion,desktopPath:'',mobilePath:''};}
  return {
    removedPages:Array.isArray(data.removedPages)?[...new Set(data.removedPages.filter((id):id is string=>typeof id==='string'&&projectId.test(id)))].slice(0,150):[],
    motionLibrary:Array.isArray(data.motionLibrary)?data.motionLibrary.slice(0,150).flatMap(item=>item&&typeof item.id==='string'&&projectId.test(item.id)&&typeof item.name==='string'?[{id:item.id,name:item.name.slice(0,150),motion:normaliseMotion(item.motion)}]:[]):[],
    galleryLayouts,pageMotion,
    filmGalleries, navigation, hiddenBlocks, blockStyles, pageCopy,
    placements, covers, projectOrder, sections, related, collections, films,
    savedLooks: cleanSavedLooks(data.savedLooks),
    motion: normaliseMotion(data.motion),
    homeGallery: cleanFrames(data.homeGallery, 150),
    homepageProjects: Array.isArray(data.homepageProjects)
      ? [...new Set(data.homepageProjects.filter((id): id is string => typeof id === 'string' && projectId.test(id)).slice(0, 150))]
      : null,
    homepageLayout: data.homepageLayout === 'grid' ? 'grid' as const : 'full' as const,
    showIntro: data.showIntro !== false,
    logo: /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(logo) ? logo : '',
    logoSize,
    logoDark:cleanLogo('logoDark'),logoLight:cleanLogo('logoLight'),favicon:cleanLogo('favicon'),faviconLight:cleanLogo('faviconLight'),
    currentWebsite: websiteImage(field('currentWebsite', 2048)),
    name: field('name', 100),
    headline: field('headline', 220),
    heroLabel: typeof data.heroLabel==='string'?field('heroLabel',100):'Photography & film',
    introLabel: typeof data.introLabel==='string'?field('introLabel',100):'Selected work',
    introText: typeof data.introText==='string'?field('introText',2500):field('about',2500),
    contactLabel: typeof data.contactLabel==='string'?field('contactLabel',100):'Contact',
    contactTitle: typeof data.contactTitle==='string'?field('contactTitle',220):'Let’s make something.',
    about: field('about', 2500),
    aboutTitle: field('aboutTitle', 140),
    aboutLabel: typeof data.aboutLabel === 'string' ? field('aboutLabel', 100) : 'About the studio',
    clientsHeading: typeof data.clientsHeading === 'string' ? field('clientsHeading', 100) : 'Selected clients',
    servicesLabel: typeof data.servicesLabel === 'string' ? field('servicesLabel', 100) : 'Capabilities',
    servicesHeading: typeof data.servicesHeading === 'string' ? field('servicesHeading', 140) : 'Services',
    services: field('services', 1500),
    email: /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(email) ? email : '',
    video: websiteImage(field('video', 2048)),
    clients: field('clients', 2000),
    galleries,
    image: websiteImage(field('image', 2048)),
    instagram: websiteImage(field('instagram', 2048)),
    imageAlt: field('imageAlt', 220),
    theme: normaliseTheme(data.theme ?? editorialTheme),
  };
}

export type Website = ReturnType<typeof normaliseWebsite>;

export type WebsiteProject = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  published?: boolean;
};

export function websiteGallery(site: Website, project: string): GalleryImage[] {
  return site.placements[project] ?? (site.galleries[project] || '').split('\n').filter(Boolean)
    .map((url, index) => ({ url, size: index % 3 === 0 ? 'wide' : 'grid', alt: '' }));
}

export function homepageWork(site: Website, projects: WebsiteProject[]) {
  const selected = site.homepageProjects && new Set(site.homepageProjects);
  return orderWebsiteProjects(projects.map(project=>({...project,...site.pageCopy[project.id]})).filter(project => !site.removedPages.includes(project.id)&&(selected ? selected.has(project.id) : project.published !== false)), site.projectOrder);
}

export function publishedWebsiteWork(settings: unknown, fallback: WebsiteProject[]) {
  const snapshot = settings && typeof settings === 'object' && 'projectSnapshot' in settings ? settings.projectSnapshot : null;
  if (!Array.isArray(snapshot)) return orderWebsiteProjects(fallback, normaliseWebsite(settings).projectOrder);
  return snapshot.slice(0, 150).flatMap(project => {
    if (!project || typeof project.id !== 'string' || !projectId.test(project.id) || typeof project.title !== 'string') return [];
    return [{
      id: project.id,
      title: project.title.slice(0, 180),
      category: typeof project.category === 'string' ? project.category.slice(0, 80) : '',
      description: typeof project.description === 'string' ? project.description.slice(0, 2000) : null,
      published: project.published !== false,
      image_url: typeof project.image_url === 'string' ? websiteImage(project.image_url.slice(0, 2048)) || null : null,
    }];
  });
}


export function libraryGallery(media: WebsiteMedia[]): GalleryImage[] {
  return media.filter(asset => asset.kind === 'photo' && websiteImage(asset.source_url)).slice(0, 150)
    .map(asset => ({ url: asset.source_url, size: 'grid', alt: '' }));
}

export function preloadWebsiteDraft(draft: Website, media: WebsiteMedia[]): Website {
  if (draft.homeGallery !== null) return draft;
  const gallery = libraryGallery(media);
  if (!gallery.length) return draft;
  return { ...draft, image: draft.image || gallery[0].url, homeGallery: gallery };
}

/** Publish only projects reachable from the homepage, About, or a published campaign. */
export function reachableWebsiteWork(site: Website, projects: WebsiteProject[]) {
  const byId = new Map(projects.map(project => [project.id, project]));
  const selected = new Set<string>();
  const pending = ['home', 'about', ...site.navigation.map(item=>item.page).filter(id=>projectId.test(id)), ...homepageWork(site, projects).map(project => project.id)];
  for (let index = 0; index < pending.length; index++) {
    const page = pending[index];
    if (site.removedPages.includes(page) || selected.has(page) || (page !== 'home' && page !== 'about' && !byId.has(page))) continue;
    selected.add(page);
    const frames = page === 'home' ? site.homeGallery ?? [] : websiteGallery(site, page);
    pending.push(...frames.flatMap(image => image.link ? [image.link] : []));
    pending.push(...(site.sections[page] ?? []).map(section => section.link).filter(Boolean), ...(site.related[page] ?? []));
  }
  return orderWebsiteProjects(projects.filter(project => selected.has(project.id)), site.projectOrder);
}

export function publishWebsiteSnapshot(site: Website, projects: WebsiteProject[]) {
  const projectSnapshot = reachableWebsiteWork(site, projects);
  const publicPages = new Set(['home', 'about', ...projectSnapshot.map(project => project.id)]);
  const keepPages = <T,>(entries: Record<string, T>) =>
    Object.fromEntries(Object.entries(entries).filter(([page]) => publicPages.has(page)));
  return {
    ...site,
    motionLibrary:[],
    navigation:site.navigation.filter(item=>!site.removedPages.includes(item.page)),
    sections:Object.fromEntries(Object.entries(keepPages(site.sections)).map(([page,sections])=>[page,sections.filter(section=>!site.hiddenBlocks.includes('section:'+section.id))])),
    related: keepPages(site.related),
    pageCopy:keepPages(site.pageCopy),
    placements: keepPages(site.placements),
    galleryLayouts:keepPages(site.galleryLayouts),
    pageMotion:Object.fromEntries(Object.entries(keepPages(site.pageMotion)).filter(([id])=>!site.hiddenBlocks.includes(id+':opening'))),
    galleries: keepPages(site.galleries),
    covers: keepPages(site.covers),
    collections: keepPages(site.collections),
    films: keepPages(site.films),
    filmGalleries:keepPages(site.filmGalleries),
    ...(site.hiddenBlocks.includes('home:introduction')?{introText:'',introLabel:'',showIntro:false}:{}),
    ...(site.hiddenBlocks.includes('home:opening')?{headline:'',heroLabel:'',image:'',video:'',motion:normaliseMotion({})}:{}),
    ...(site.hiddenBlocks.includes('about:biography')?{about:'',aboutTitle:'',aboutLabel:'',clients:'',clientsHeading:''}:{}),
    ...(site.hiddenBlocks.includes('about:services')?{services:'',servicesHeading:'',servicesLabel:''}:{}),
    ...(site.hiddenBlocks.includes('contact:footer')?{email:'',contactLabel:'',contactTitle:''}:{}),
    projectSnapshot: projectSnapshot.map(project=>({...project,...site.pageCopy[project.id]})),
  };
}

export function websiteFilms(site:Website,page:string){return site.filmGalleries[page]??(site.films[page]?[site.films[page]]:[]);}
