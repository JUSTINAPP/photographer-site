export const websiteStartCookie = 'fresnel-website-start';
export function websiteStartPath(value: string | undefined): string | undefined {
  return value === 'import' ? '/studio/import' : value === 'create' ? '/studio/website' : undefined;
}
