import assert from 'node:assert/strict';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { completeSignIn } from '../src/lib/complete-sign-in';

function client({ joined = null, access = null, studios = [], inviteError = null, setupError = null }: {
  joined?: string | null; access?: string | null; studios?: { id: string }[];
  inviteError?: object | null; setupError?: object | null;
} = {}) {
  const calls: string[] = [];
  const db = {
    rpc: async (name: string) => {
      calls.push(name);
      if (name === 'accept_studio_invitations') return { data: joined, error: inviteError };
      if (name === 'studio_role') return { data: access, error: null };
      return { data: setupError ? null : 'new-private-studio', error: setupError };
    },
    from: () => ({ select: () => ({ limit: async () => ({ data: studios, error: null }) }) }),
  } as unknown as SupabaseClient;
  return { db, calls };
}

test('a verified new photographer receives a private studio', async () => {
  const { db, calls } = client();
  assert.deepEqual(await completeSignIn(db), { studio: 'new-private-studio' });
  assert.deepEqual(calls, ['accept_studio_invitations', 'initialize_studio']);
});

test('returning users reuse their accessible studio', async () => {
  const { db, calls } = client({ studios: [{ id: 'own-studio' }] });
  assert.deepEqual(await completeSignIn(db), { studio: undefined });
  assert.ok(!calls.includes('initialize_studio'));
});

test('an accepted team invitation selects the invited studio', async () => {
  const { db, calls } = client({ joined: 'invited-studio' });
  assert.deepEqual(await completeSignIn(db), { studio: 'invited-studio' });
  assert.ok(!calls.includes('initialize_studio'));
});

test('a supplied studio target requires membership', async () => {
  const denied = client();
  assert.deepEqual(await completeSignIn(denied.db, 'someone-elses-studio'), { error: 'access' });
  const allowed = client({ access: 'admin' });
  assert.deepEqual(await completeSignIn(allowed.db, 'invited-studio'), { studio: 'invited-studio' });
});

test('setup and invitation failures stop onboarding', async () => {
  assert.deepEqual(await completeSignIn(client({ setupError: {} }).db), { error: 'signin' });
  const { db, calls } = client({ inviteError: {} });
  assert.deepEqual(await completeSignIn(db), { error: 'signin' });
  assert.deepEqual(calls, ['accept_studio_invitations']);
});
