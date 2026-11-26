export const imageWidths = [160,320,480,640,960,1280,1600,1920] as const;
export function imageWidth(width:number){return imageWidths.find(size=>size>=width)??1920;}
export function imageDisplayUrl(source:string,width:number) {
 const size=imageWidth(width);
 if(/\.(svg|gif)(?:$|[?#])/i.test(source))return source;
 if(source.startsWith('/')&&!source.startsWith('//')) return '/_next/image?url='+encodeURIComponent(source)+'&w='+size+'&q=80';
 try {
  const url=new URL(source);
  if(url.protocol!=='https:'||url.username||url.password)return source;
  if(/\.(svg|gif)(?:$|\?)/i.test(url.pathname))return source;
  // Signed originals must remain private and must never enter a public image cache.
  if(/\/(private|authenticated)\//i.test(url.pathname))return source;
  if([...url.searchParams.keys()].some(key=>/token|signature|credential|expires|authorization/i.test(key)))return source;
  if(url.hostname==='images.squarespace-cdn.com'||url.hostname==='static1.squarespace.com') {
   url.searchParams.set('format',size+'w');return url.href;
  }
  return '/api/image?src='+encodeURIComponent(url.href)+'&w='+size;
 }catch{return source;}
}
