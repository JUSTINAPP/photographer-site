import assert from 'node:assert/strict';
import test from 'node:test';
import { emailStudioInvitation } from '../src/lib/studio-invitation';

test('email onboarding uses the saved recipient and callback without borrowing the admin session', async t => {
  const original = { ...process.env };
  process.env.NEXT_PUBLIC_SITE_URL = 'https://www.fresnelstudio.com';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-public-key';
  t.after(() => { process.env = original; });
  let body: Record<string, unknown> = {};
  let target = '';
  t.mock.method(globalThis, 'fetch', async (input: string, init: RequestInit) => {
    target = String(input);
    body = JSON.parse(String(init.body));
    assert.equal(new Headers(init.headers).get('authorization'), 'Bearer test-public-key');
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  assert.deepEqual(await emailStudioInvitation('info@tobyburrows.com'), { error: undefined });
  assert.match(target, /\/auth\/v1\/otp/);
  assert.match(decodeURIComponent(target), /redirect_to=https:\/\/www.fresnelstudio.com\/auth\/callback/);
  assert.equal(body.email, 'info@tobyburrows.com');
  assert.equal(body.create_user, true);
  assert.equal(body.code_challenge, null); // Link works in the recipient's browser.
});
