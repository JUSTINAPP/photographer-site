import type { SupabaseClient } from '@supabase/supabase-js';

export async function completeSignIn(db: SupabaseClient, target?: string): Promise<{ studio?: string; error?: 'signin' | 'access' }> {
  const { data: joined, error: inviteError } = await db.rpc('accept_studio_invitations');
  if (inviteError) return { error: 'signin' };

  if (target) {
    const { data: access, error } = await db.rpc('studio_role', { studio: target });
    if (error) return { error: 'signin' };
    if (!access) return { error: 'access' };
  } else if (!joined) {
    const accessible = await db.from('workspaces').select('id').limit(1);
    if (accessible.error) return { error: 'signin' };
    if (!accessible.data.length) {
      const { data: studio, error } = await db.rpc('initialize_studio');
      return error || !studio ? { error: 'signin' } : { studio };
    }
  }

  return { studio: target ?? joined ?? undefined };
}
