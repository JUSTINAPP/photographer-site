export const invitationCookie = 'fresnel-join-studio';
export const studioCookie = 'fresnel-studio';
export const workspaceIdPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
export type StudioRole = 'owner' | keyof typeof teamRoles;

export const teamRoles = {
  admin: 'Admin',
  social: 'Social media manager',
  assistant: 'Assistant',
  editor: 'Website editor',
  viewer: 'Website viewer',
} as const;
export const isStudioAdmin = (role: StudioRole) => role === 'owner' || role === 'admin';
export const canEditWebsite = (role: StudioRole) => isStudioAdmin(role) || role === 'editor';
