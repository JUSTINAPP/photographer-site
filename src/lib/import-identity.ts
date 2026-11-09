export function mediaIdentity(input: string) {
  const url = new URL(input);
  if (['images.squarespace-cdn.com', 'static1.squarespace.com'].includes(url.hostname)) {
    if (/^\d+w$/i.test(url.searchParams.get('format') ?? '')) url.searchParams.delete('format');
    if (url.pathname.startsWith('/content/v1/')) url.hostname = 'images.squarespace-cdn.com';
  }
  url.hash = '';
  return url.href;
}

export function vimeoEmbed(input: string) {
  try {
    const url = new URL(input);
    if (url.origin !== 'https://player.vimeo.com' || url.username || url.password || !/^\/video\/\d+\/?$/.test(url.pathname)) return null;
    const embed = new URL(url.pathname.replace(/\/$/, ''), url.origin);
    const hash = url.searchParams.get('h');
    if (hash && /^[a-z0-9]+$/i.test(hash)) embed.searchParams.set('h', hash);
    return embed.href;
  } catch {
    return null;
  }
}
