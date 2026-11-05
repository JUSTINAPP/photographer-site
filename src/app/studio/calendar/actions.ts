'use server';

import { revalidatePath } from 'next/cache';
import { requireStudioAccess } from '@/lib/supabase';
import { eventTypes, socialChannels, validDay } from '@/lib/studio-planner';

export async function changeSchedule(kind: 'event' | 'social', form: FormData) {
  if (kind !== 'event' && kind !== 'social') throw new Error('Invalid schedule type.');
  const { db, workspace } = await requireStudioAccess('owner');
  const field = (name: string) => String(form.get(name) ?? '').trim();
  const id = field('id');
  if (id && !/^[a-f0-9-]{36}$/i.test(id)) throw new Error('Invalid item.');
  const social = kind === 'social';
  if (id && field('intent') === 'delete') {
    const { error } = await db.from('studio_schedule').delete().eq('workspace_id', workspace.id).eq('kind', kind).eq('id', id);
    if (error) throw new Error('Could not remove this item.');
  } else {
    const title = field('title').slice(0, 150);
    const day = field('day');
    const localTime = field('local_time');
    const status = social ? field('status') : 'planned';
    const category = field('category');
    if (!title || (day && !validDay(day)) || (localTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(localTime))
      || !(social ? socialChannels : eventTypes).includes(category)
      || (social && !['draft', 'scheduled', 'posted'].includes(status))
      || (!social && !day) || (status === 'scheduled' && (!day || !localTime))) {
      throw new Error('Enter a title, a valid date and a time for scheduled posts.');
    }
    const values = {
      workspace_id: workspace.id, kind, title, day: day || null, local_time: localTime || null, status, category,
      notes: field('notes').slice(0, 3000), media_id: social ? field('media_id') || null : null,
    };
    const table = db.from('studio_schedule');
    const { error } = await (id
      ? table.update(values).eq('workspace_id', workspace.id).eq('kind', kind).eq('id', id)
      : table.insert(values));
    if (error) throw new Error('Could not save this item.');
  }
  for (const path of ['/studio', '/studio/calendar', '/studio/social']) revalidatePath(path);
}
