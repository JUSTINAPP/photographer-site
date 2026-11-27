import {mediaIdentity} from './import-identity';
import {homepageWork,websiteGallery,type Website,type WebsiteProject,type GalleryImage} from './website';
export function pageImages(site:Website,page:string){return page==='home'?site.homeGallery??[]:websiteGallery(site,page);}
export function setPageImages(site:Website,page:string,images:GalleryImage[],projects:WebsiteProject[]):Website{
 if(page!=='home')return {...site,placements:{...site.placements,[page]:images}};
 const linked=new Set(images.map(image=>image.link).filter(Boolean));
 return {...site,homeGallery:images,homepageProjects:linked.size?homepageWork(site,projects).map(p=>p.id).filter(id=>!linked.has(id)):site.homepageProjects};
}
export function addPageImage(site:Website,page:string,image:GalleryImage,projects:WebsiteProject[]):Website{
 const images=pageImages(site,page);const index=images.findIndex(existing=>mediaIdentity(existing.url)===mediaIdentity(image.url));
 const next=index<0?[...images,image]:images.map((existing,i)=>i===index?{...existing,alt:image.alt||existing.alt,link:image.link}:existing);
 return setPageImages(site,page,next.slice(0,page==='home'?150:100),projects);
}
export function imagePageTarget(link:string|undefined,projects:WebsiteProject[],base:string){
 if(link==='home')return {id:'home',title:'Home page',href:base};
 if(link==='about')return {id:'about',title:'About + Services',href:base+'?about=1'};
 const page=projects.find(project=>project.id===link);return page?{id:page.id,title:page.title,href:base+'?campaign='+encodeURIComponent(page.id)}:null;
}
/** Apply one confirmed picker selection against the latest draft in a single state update. */
export function addPageImages(site:Website,page:string,images:GalleryImage[],projects:WebsiteProject[]){return images.reduce((next,image)=>addPageImage(next,page,image,projects),site);}
