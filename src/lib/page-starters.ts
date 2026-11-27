import {type Website} from './website';
export const PAGE_STARTERS=[
 {id:'natural',name:'Photo gallery',description:'Original image proportions in a flowing masonry gallery. Starts without a large opening.'},
 {id:'grid',name:'Uniform gallery',description:'An orderly cropped grid for a consistent photographic series. Starts without a large opening.'},
 {id:'film',name:'Films & motion',description:'A clean page for films with black players and simple controls. Add your films from Media.'},
 {id:'story',name:'Text & story',description:'A simple heading and introduction for a biography, services or project story.'},
] as const;
export type PageStarter=typeof PAGE_STARTERS[number]['id'];
export function addWebsitePage(site:Website,id:string,title:string,style:PageStarter,existingHome:string[]):Website{
 return {...site,projectOrder:[...site.projectOrder,id],homepageProjects:[...new Set([...existingHome,id])],navigation:site.navigation.length?[...site.navigation,{label:title,page:id,href:''}]:site.navigation,
 galleryLayouts:{...site.galleryLayouts,[id]:style==='natural'?'natural':'grid'},placements:{...site.placements,[id]:[]},filmGalleries:{...site.filmGalleries,[id]:[]},hiddenBlocks:[...site.hiddenBlocks,id+':opening'],removedPages:site.removedPages.filter(key=>key!==id)};
}
