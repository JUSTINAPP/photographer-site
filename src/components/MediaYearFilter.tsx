'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ActionButton } from './ActionFeedback';
import TeamAccessSelect from './TeamAccessSelect';

export default function MediaYearFilter({ kind, collection, gallery, year, years, count }: {
  kind: 'photo' | 'video'; collection?: string; gallery?: string; year: string; years: number[]; count: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const options: [string, string][] = [
    ['', 'All years'],
    ...years.map((value): [string, string] => [String(value), String(value)]),
    ['undated', 'No year set'],
  ];
  return <form action="/studio/media" className="media-year-filter" onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = new URLSearchParams();
    for (const name of ['view', 'collection', 'gallery', 'year']) {
      const value = data.get(name);
      if (typeof value === 'string' && value) query.set(name, value);
    }
    startTransition(() => router.push('/studio/media' + (query.size ? '?' + query : ''), { scroll: false }));
  }}>
    {kind === 'video' && <input type="hidden" name="view" value="videos" />}
    {collection && <input type="hidden" name="collection" value={collection} />}
    {gallery && <input type="hidden" name="gallery" value={gallery} />}
    <span>Year</span><TeamAccessSelect label="Year" name="year" initial={year} options={options} />
    <ActionButton className="secondary-button" busy={pending}>Filter</ActionButton>
    <span role="status">{pending ? 'Loading media…' : `${count.toLocaleString()} ${kind === 'photo' ? 'photos' : 'videos'}`}</span>
  </form>;
}
