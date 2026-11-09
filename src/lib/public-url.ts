import ipaddr from 'ipaddr.js';

export function publicAddress(address:string){try{return ipaddr.process(address).range()==='unicast'}catch{return false}}
export function websiteUrl(input:string){const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443'))throw new Error('Enter a public HTTPS website URL.');if(ipaddr.isValid(url.hostname.replace(/^\[|\]$/g,''))&&!publicAddress(url.hostname.replace(/^\[|\]$/g,'')))throw new Error('Private addresses cannot be imported.');if(url.hostname==='localhost'||url.hostname.endsWith('.local'))throw new Error('Local addresses cannot be imported.');url.hash='';return url;}

// Only import entry fields accept a bare address. Network requests and redirects
// still use the strict HTTPS validator.
export function importWebsiteUrl(input: string) {
  const address = input.trim();
  if (!address || /\s/.test(address)) throw new Error('Enter a website address, such as www.yourwebsite.com.');
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(address) ? address : 'https://' + address;
  if (!URL.canParse(withScheme)) throw new Error('Enter a website address, such as www.yourwebsite.com.');
  return websiteUrl(withScheme);
}
