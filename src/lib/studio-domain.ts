import { Resolver } from 'node:dns/promises';

export function portfolioHostname(value: string) {
  const name = value.trim().toLowerCase().replace(/\.$/, '');
  if (name.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(name)) return '';
  if (['fresnelstudio.com', 'vercel.app', 'localhost', 'local', 'internal'].some(domain => name === domain || name.endsWith('.' + domain))) return '';
  return name;
}

export async function portfolioDomainTokens(host: string) {
  if (!portfolioHostname(host)) return [];
  try {
    const records = await new Resolver({ timeout: 1500, tries: 1 }).resolveTxt('_fresnel.' + host);
    return records.map(record => record.join(''));
  } catch {
    return [];
  }
}
