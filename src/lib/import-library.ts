import type { SupabaseClient } from '@supabase/supabase-js';
import { mediaIdentity } from './import-identity';

export async function existingMediaIdentities(db: SupabaseClient, workspace: string) {
  const keys = new Set<string>();
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await db.from('studio_media').select('source_url')
      .eq('workspace_id', workspace).order('id').range(start, start + pageSize - 1);
    if (error) throw new Error('Could not check for media already in this studio.');
    for (const item of data) keys.add(mediaIdentity(item.source_url));
    if (data.length < pageSize) return keys;
  }
}
