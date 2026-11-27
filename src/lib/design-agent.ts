import {normaliseTheme,type SiteTheme} from './website-theme';
export type DesignPatch={theme?:SiteTheme;logoSize?:number;headline?:string;about?:string;homepageLayout?:'grid'|'full';showIntro?:boolean};
export type SavedLook={id:string;name:string;theme:SiteTheme;logoSize:number;homepageLayout:'grid'|'full';references:string[]};
export function cleanDesignPatch(input:unknown):DesignPatch{
 const x=input&&typeof input==='object'?input as Record<string,unknown>:{};const patch:DesignPatch={};
 if(x.theme&&typeof x.theme==='object')patch.theme=normaliseTheme(x.theme);
 if(typeof x.logoSize==='number'&&Number.isFinite(x.logoSize))patch.logoSize=Math.round(Math.max(24,Math.min(120,x.logoSize)));
 for(const key of ['headline','about'] as const)if(typeof x[key]==='string')patch[key]=x[key].slice(0,key==='headline'?220:2500);
 if(x.homepageLayout==='grid'||x.homepageLayout==='full')patch.homepageLayout=x.homepageLayout;
 if(typeof x.showIntro==='boolean')patch.showIntro=x.showIntro;
 return patch;
}
export function cleanSavedLooks(input:unknown):SavedLook[]{
 if(!Array.isArray(input))return [];
 const seen=new Set<string>();return input.slice(0,24).flatMap(x=>{
 if(!x||typeof x.id!=='string'||!/^[a-f0-9-]{36}$/i.test(x.id)||seen.has(x.id)||typeof x.name!=='string'||!x.name.trim())return [];seen.add(x.id);
 return [{id:x.id,name:x.name.trim().slice(0,70),theme:normaliseTheme(x.theme),logoSize:cleanDesignPatch(x).logoSize??44,homepageLayout:x.homepageLayout==='full'?'full' as const:'grid' as const,references:Array.isArray(x.references)?x.references.filter((s:unknown)=>typeof s==='string'&&/^https:\/\//.test(s)).slice(0,3).map((s:string)=>s.slice(0,2048)):[]}];});
}
export const DESIGN_TOOL={name:'propose_website',description:'Propose only the requested changes to a photographer’s draft. No scripts or HTML.',input_schema:{type:'object',properties:{explanation:{type:'string'},templateName:{type:'string'},changes:{type:'object',properties:{theme:{type:'object',properties:{layout:{type:'string',enum:['editorial','campaign','gallery']},fonts:{type:'string',enum:['classic','editorial','swiss','garamond','contemporary','mono','baskerville']},palette:{type:'string',enum:['white','paper','stone','dark','custom']},bg:{type:'string'},ink:{type:'string'},header:{type:'string',enum:['left','centered','stacked']},hero:{type:'string',enum:['full','split','framed','text']},social:{type:'string',enum:['footer','header','both']},headerAppearance:{type:'string',enum:['tinted','transparent','solid']},headerLogo:{type:'string',enum:['auto','dark','light']},scrolledHeaderLogo:{type:'string',enum:['auto','dark','light']},headerBorder:{type:'boolean'},columns:{type:'number'},gap:{type:'number'},heroFit:{type:'string',enum:['cover','contain']}},additionalProperties:false},logoSize:{type:'number'},headline:{type:'string'},about:{type:'string'},homepageLayout:{type:'string',enum:['grid','full']},showIntro:{type:'boolean'}},additionalProperties:false}},required:['explanation','changes','templateName'],additionalProperties:false}};
