export type PlatformStudio = {
  id: string; name: string; email: string; claimed: boolean; created_at: string;
  last_sign_in_at: string | null; live: boolean; public_id: string | null;
  plan: string; status: string; trial_ends_at: string | null; notes: string; website: string;
  media_count: number; project_count: number; team_count: number;
};

export const prospectStages: [string, string][] = [
  ['new', 'New'], ['contacted', 'Contacted'], ['replied', 'Replied'], ['demo', 'Demo'],
  ['onboarding', 'Onboarding'], ['won', 'Customer'], ['lost', 'Closed'],
];
export const planOptions: [string, string][] = [['independent', 'Independent'], ['studio', 'Studio'], ['production', 'Production']];
export const accountStatuses: [string, string][] = [['trial', 'Trial'], ['active', 'Active'], ['complimentary', 'Complimentary'], ['paused', 'Paused']];
export const platformDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeZone: 'Australia/Sydney' }).format(new Date(value)) : '—';
