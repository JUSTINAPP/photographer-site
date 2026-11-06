import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homepageWork, normaliseWebsite, publishedWebsiteWork, type WebsiteProject } from '../src/lib/website';

const first = { id: '11111111-1111-1111-1111-111111111111', title: 'First', category: '', description: null, image_url: null, published: true };
const second = { ...first, id: '22222222-2222-2222-2222-222222222222', title: 'Second', published: false };
const projects: WebsiteProject[] = [first, second];

test('website selection can include imported drafts and explicitly exclude all legacy projects', () => {
  assert.deepEqual(homepageWork(normaliseWebsite({}), projects), [first]);
  const site = normaliseWebsite({ homepageProjects: [first.id, second.id], projectOrder: [second.id, first.id] });
  assert.deepEqual(homepageWork(site, projects), [second, first]);
  assert.deepEqual(homepageWork(normaliseWebsite({ homepageProjects: [] }), projects), []);
});

test('published work uses the saved selection snapshot and preserves legacy fallback', () => {
  assert.deepEqual(publishedWebsiteWork({}, [first]), [first]);
  assert.deepEqual(publishedWebsiteWork({ projectSnapshot: [] }, [first]), []);
  const snapshot = publishedWebsiteWork({ projectSnapshot: [{ ...second, image_url: 'javascript:alert(1)' }] }, [first]);
  assert.equal(snapshot[0].id, second.id);
  assert.equal(snapshot[0].image_url, null);
});

test('a new draft starts with library photos in supplied order while an explicitly empty gallery stays empty', async () => {
  const { preloadWebsiteDraft } = await import('../src/lib/website');
  const media = [
    { id: 'a', name: 'First', source_url: 'https://example.com/a.jpg', kind: 'photo', website_selected: false },
    { id: 'b', name: 'Second', source_url: 'https://example.com/b.jpg', kind: 'photo', website_selected: false },
    { id: 'c', name: 'Video', source_url: 'https://example.com/c.mp4', kind: 'video', website_selected: false },
  ] as const;
  const draft = preloadWebsiteDraft(normaliseWebsite({}), [...media]);
  assert.equal(draft.image, media[0].source_url);
  assert.deepEqual(draft.homeGallery?.map(image => image.url), [media[0].source_url, media[1].source_url]);
  assert.deepEqual(preloadWebsiteDraft(normaliseWebsite({ homeGallery: [] }), [...media]).homeGallery, []);
});
