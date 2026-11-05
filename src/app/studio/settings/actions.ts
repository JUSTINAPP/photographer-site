'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStudio } from '@/lib/supabase';

export async function savePortfolioName(form: FormData) {
  const name = String(form.get('name') ?? '').trim().slice(0, 100);
  if (!name) return;
  const { db, workspace } = await requireStudio();
  const { error } = await db.rpc('rename_studio_portfolio', { studio_id: workspace.id, portfolio_name: name });
  if (error) throw new Error('The portfolio name could not be saved.');
  revalidatePath('/studio', 'layout');
  redirect('/studio/settings');
}
