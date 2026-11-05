# photographer-site

Premium portfolio and private production workspace. Next.js 15, React 19, TypeScript and Supabase. Designed for GitHub → Vercel deployment.

## Platform sales website

The root `/` introduces the complete photographer/studio platform, with an interactive overview, shoot planning, social calendar and business workflow preview. `/pricing` presents proposed AUD plans, with no checkout. David’s portfolio example is at `/examples/david-mandelberg`; `/demo` remains the password-free studio tour. Concept workflow data is illustrative and does not publish to social accounts or process payments. Planned tools are labelled.

## First release

- Dark responsive example portfolio for David Mandelberg, with original AI concept fashion/sailing/lifestyle imagery, project pages and optional muted hero video.
- Read-only studio tour at `/demo` and authenticated studio at `/studio`.
- Email-link sign-in, owner-isolated studios and private draft projects.
- Website import preview: public HTTPS HTML, homepage discovery and up to five linked project pages. Tested against davidmandelberg.com (Squarespace).
- Review/select/import, then separate publication with a permission confirmation.
- Private original-media storage foundation. Upload interface, full image copying, RAW handling and video import are not implemented yet.

No generated imagery is represented as David Mandelberg's original photography. The example is a design study; do not imply endorsement. All production tools marked “next release” are roadmap items.

## Run locally

Requires Node 20.19+ (tested on Node 24).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Fill the public Supabase URL and anon key in `.env.local`. Secrets are ignored by Git. No service-role key is needed by the application.

## Database and authentication

Project: `yytbpqaqmpexdgxlshhl`. Initial migration is in `supabase/migrations` and was applied during setup. For another environment:

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Set Supabase Authentication → URL Configuration to the deployment origin and allow `https://YOUR_DOMAIN/auth/callback` plus local callback URLs used for development. Set `NEXT_PUBLIC_SITE_URL` to the same origin. Use the existing Resend account for Supabase custom SMTP when the verified sender/domain is chosen; until configured, Supabase's built-in email delivery has restrictions.

Sign in through `/login` on the same browser/device that requests the link (PKCE). First successful callback creates the studio through an authenticated RPC. Each studio is owned by its signed-in user. The current release does not yet support team membership.

Set server-only `PUBLIC_STUDIO_ID` to the intended workspace UUID to show its published projects on the example homepage. Without it, only AI demo projects show. Other studios can never automatically appear on this example portfolio.

## Vercel

Import the GitHub repo as a Next.js project. Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (the canonical production origin)
- `PUBLIC_STUDIO_ID` (after first sign-in)
- Optional `NEXT_PUBLIC_HERO_VIDEO_URL` (HTTPS MP4; generated footage must be supplied later)

The Supabase project URL and public anon key may be sourced through Vercel's Supabase integration. `.env.local` is never pushed. Rebuild after changing `NEXT_PUBLIC_*` values.

## Import boundaries

The importer reads metadata and links cover images from their original hosts; it does not copy image/video files or reproduce whole page layouts. JavaScript-only/password-protected pages and full-site crawling are not supported. Source images may depend on their original site's continued availability. Import is authenticated, limited to once per minute per studio, size/time bounded and protected against private-address access and redirect-based SSRF. Metadata is text, never injected HTML. Content must be reviewed before publication. The initial public example remains noindex.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

`tests/database.integration.mjs` can be run with temporary, locally supplied `SUPABASE_TEST_SERVICE_KEY` plus public project credentials. It creates and removes two temporary accounts to test actual access controls, publication, rate limiting and private storage. Never use a service key in browser code or commit it.

Generated-image prompts and provenance are in `public/images/provenance.json`. Instrument fonts are self-hosted under their included SIL Open Font License.

## Next stages

Choose AI video provider; configure Resend sender; connect production origin and first owner studio; add full asset migration/uploads, project editing, portfolio configuration, production briefs/moodboards, crew/kit reservations, payment/email integrations and social publishing.
