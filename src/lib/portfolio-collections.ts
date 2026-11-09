export const portfolioCollections = [
  { name: 'Portfolio', path: '/' },
  { name: 'Advertising', path: '/clients' },
  { name: 'Motion', path: '/motion' },
  { name: 'Personal', path: '/personal' },
] as const;

export function collectionAnchor(name: string) {
  return 'collection-' + name.toLowerCase();
}
