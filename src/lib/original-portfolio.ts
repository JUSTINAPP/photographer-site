import {mediaIdentity} from './import-identity';
import {normaliseWebsite,type Website,type GalleryImage} from './website';
import {normaliseTheme} from './website-theme';
export type MatchedCampaign={id:string;title:string;category:string;source_url:string;photos:string[];film:string};
export type OriginalPortfolioPlan={source:string;pages:MatchedCampaign[];parents:{id:string;name:string}[];instagram:string;unmatched:number;missing:string[]};
export function projectSourceKey(source:string){try{const u=new URL(source);return u.hostname.toLowerCase().replace(/^www\./,'')+u.pathname.replace(/\/+$/,'');}catch{return source.replace(/\/+$/,'');}}
/** Reuse URLs and campaign IDs; this operation never inserts Media or uploads files. */
export function applyOriginalPortfolio(site:Website,plan:OriginalPortfolioPlan,keepOpening:boolean):Website{
 const placements={...site.placements},covers={...site.covers},pageCopy={...site.pageCopy},galleryLayouts={...site.galleryLayouts},films={...site.films},filmGalleries={...site.filmGalleries},collections={...site.collections};
 const hidden=new Set(site.hiddenBlocks);const frames=(urls:string[],previous:GalleryImage[])=>{const seen=new Set<string>();return urls.flatMap(url=>{const key=mediaIdentity(url);if(seen.has(key))return [];seen.add(key);return [{...(previous.find(frame=>mediaIdentity(frame.url)===key)||{size:'grid' as const,alt:''}),url}];});};
 const cards=(name:string)=>plan.pages.filter(p=>p.category===name&&p.photos.length).map(p=>({url:p.photos[0],size:'grid' as const,alt:p.title,link:p.id}));
 for(const page of plan.pages){placements[page.id]=frames(page.photos,site.placements[page.id]||[]);covers[page.id]=page.photos[0]||covers[page.id]||'';pageCopy[page.id]={...pageCopy[page.id],title:page.title,category:page.category};galleryLayouts[page.id]='natural';collections[page.id]=page.category;hidden.add(page.id+':opening');hidden.add(page.id+':copy');if(page.film){films[page.id]=page.film;filmGalleries[page.id]=[page.film];}}
 for(const parent of plan.parents){placements[parent.id]=cards(parent.name);galleryLayouts[parent.id]='cards';hidden.add(parent.id+':opening');hidden.add(parent.id+':copy');const sources=plan.pages.filter(p=>p.category===parent.name&&!p.photos.length).map(p=>p.film).filter(Boolean);filmGalleries[parent.id]=[...new Set(sources)];}
 galleryLayouts.home='cards';if(keepOpening)hidden.delete('home:opening');else hidden.add('home:opening');hidden.add('home:introduction');
 const ids=new Set([...plan.pages.map(p=>p.id),...plan.parents.map(p=>p.id)]);
 const navigation=[{label:'Portfolio',page:'home',href:''},...plan.parents.map(p=>({label:p.name,page:p.id,href:''})),...(plan.instagram?[{label:'Instagram',page:'',href:plan.instagram}]:[]),{label:'Contact',page:'contact',href:''}];
 return normaliseWebsite({...site,theme:normaliseTheme({...site.theme,layout:'campaign'}),currentWebsite:site.currentWebsite||plan.source,showIntro:false,homeGallery:cards('Portfolio'),homepageProjects:[],homepageLayout:'grid',placements,covers,pageCopy,galleryLayouts,films,filmGalleries,collections,navigation,instagram:site.instagram||plan.instagram,hiddenBlocks:[...hidden],removedPages:site.removedPages.filter(id=>!ids.has(id)),projectOrder:[...ids,...site.projectOrder.filter(id=>!ids.has(id))]});
}
