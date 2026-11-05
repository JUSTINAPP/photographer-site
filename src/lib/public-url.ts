import ipaddr from 'ipaddr.js';

export function publicAddress(address:string){try{return ipaddr.process(address).range()==='unicast'}catch{return false}}
export function websiteUrl(input:string){const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443'))throw new Error('Enter a public HTTPS website URL.');if(ipaddr.isValid(url.hostname.replace(/^\[|\]$/g,''))&&!publicAddress(url.hostname.replace(/^\[|\]$/g,'')))throw new Error('Private addresses cannot be imported.');if(url.hostname==='localhost'||url.hostname.endsWith('.local'))throw new Error('Local addresses cannot be imported.');url.hash='';return url;}
