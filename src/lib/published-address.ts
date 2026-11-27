export const validPublishedSlug=(slug:string)=>/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug);
export function publishedAddress(id:string,slug?:string|null){return slug&&validPublishedSlug(slug)?'/'+slug:'/sites/'+id;}
