import {vimeoEmbed} from './import-identity';
/** Display settings belong to the player, leaving imported identities and private hashes intact. */
export function cleanFilmEmbed(input:string){
 const embed=vimeoEmbed(input);if(!embed)return null;
 const url=new URL(embed);
 for(const [key,value] of Object.entries({title:'0',byline:'0',portrait:'0',badge:'0',vimeo_logo:'0',controls:'0',transparent:'0',dnt:'1',playsinline:'1',autopause:'1'}))url.searchParams.set(key,value);
 return url.href;
}
