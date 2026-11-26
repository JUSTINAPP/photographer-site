import { cache } from 'react';
import { redirect } from 'next/navigation';
import { database } from './supabase';

export const requirePlatformAdmin = cache(async () => {
  const db = await database();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await db.rpc('is_platform_admin');
  if (error || data !== true) redirect('/studio');
  return { db, user };
});

import type { PlatformStudio } from './platform-types';

export async function platformStudios() {
  const { db } = await requirePlatformAdmin();
  const { data, error } = await db.rpc('platform_studio_directory');
  if (error) throw new Error('Studios could not be loaded. Please refresh Admin.');
  return (data ?? []) as PlatformStudio[];
}

