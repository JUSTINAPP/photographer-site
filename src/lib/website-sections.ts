export type WebsiteSection = {
  id: string;
  layout: 'full' | 'split' | 'text';
  heading: string;
  text: string;
  image: string;
  alt: string;
  link: string;
};

export const sectionLayouts = [
  ['full', 'Full screen', 'Edge-to-edge photo with text over it'],
  ['split', 'Split image + text', 'Photo on the left, text on the right'],
  ['text', 'Text only', 'A heading and a short story or credits'],
] as const;

export function campaignHref(base: string, id: string) {
  return base + '?campaign=' + encodeURIComponent(id);
}
