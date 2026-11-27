const projectId=/^[a-f0-9-]{36}$/i;
export function draftPreviewUrl(studio:string,page:string,revision:string){
 const query=new URLSearchParams({studio,revision});
 if(page==='about')query.set('about','1');else if(projectId.test(page))query.set('campaign',page);
 return '/studio/website/preview?'+query;
}
export async function saveThenPreview<T>(draft:T,save:(draft:T)=>Promise<{error?:string;draft?:T}>,open:(saved:T)=>void){
 const result=await save(draft);if(result.error)throw Error(result.error);const saved=result.draft??draft;open(saved);return saved;
}
