# Fresnel image and navigation performance

## Implemented

- Responsive `SmartImage` previews across public portfolios, media, the website editor, imports and social content. Images outside the viewport load lazily and decode asynchronously; the main hero loads eagerly with high priority.
- Squarespace originals use its existing CDN with a width-specific `format` parameter. Other public HTTPS photos use a bounded, cached WebP transformation. Source URLs and private originals are unchanged. Signed/private image URLs and vector/animated assets bypass the shared cache.
- The image gateway uses the importer’s public-IP validation, DNS pinning and redirect validation. Input downloads are bounded to 25 MB / 80 million pixels, transformations have bounded widths, and original bytes never enter the client preview response. Output is cached for a week with ETags for conditional requests.
- React request memoisation shares the authenticated client, user and studio lookups across layout, page and sidebar. Nothing in this authentication data is cached across users. The sidebar reads the website name/public identifier instead of downloading the full draft and published galleries.
- A 30-second in-memory browser router cache retains recently visited dynamic pages. Cookie-changing studio switches and existing server-action revalidation invalidate affected content. No private studio HTML is assigned public CDN caching.
- Sidebar destinations prefetch on deliberate hover or keyboard focus instead of fetching every large page. Fast transitions delay spinner feedback by 150 ms. Loading placeholders retain the light workspace background.
- Social calendar pages fetch media already referenced by posts. The full catalogue loads on opening the post editor and is reused in that studio for 30 seconds. Ideas, guidelines and analytics no longer load the whole catalogue. Library metadata batches load in parallel after the first count-bearing response.
- Studio → Site speed reports recent click-to-visible-content timings, initial largest content paint, observed slow interactions and reported image transfer/cache data. Diagnostics stay in the browser tab; no analytics provider receives them.

## Measured sample

One public David Mandelberg photograph was sampled on 26 November 2026:

| Version | Bytes |
| --- | ---: |
| Original source | 764,382 |
| Squarespace 400px display version | 49,215 |
| Fresnel 480px WebP preview | 24,032 |

These are reductions of 93.6% and 96.9% for that photograph, not claims about the entire library or overall navigation speed. Local production-server checks returned the resized preview in 786 ms cold and 5 ms warm; those are local lab timings, not production latency guarantees. ETag validation returned HTTP 304, and private/signed input URL tests returned HTTP 400.

`npm test` includes URL/variant handling, metadata removal, orientation-aware resizing, no enlargement and preservation of source bytes. `npm run build` verifies routes and image gateway packaging. Browser timings are intended to show cold/warm navigation on the user's own device and connection.

## Function region

The Supabase dashboard confirmed `ap-southeast-1` (Singapore). Before this change, a production response carried `x-vercel-id: syd1::iad1::…`, identifying US application execution. `vercel.json` now places functions in `sin1` alongside the database. Static files continue to use Vercel's global edge network. This follows [Vercel's function-region guidance](https://vercel.com/docs/functions/configuring-functions/region).
