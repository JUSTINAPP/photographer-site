# Website design partner

Production secret: `ANTHROPIC_API_KEY`. Optional `ANTHROPIC_DESIGN_MODEL` defaults to `claude-sonnet-4-6`. Redeploy after adding a key. Never prefix these with NEXT_PUBLIC.

Create → Logo → Pages → Opening → Publish. Reference sites are read with DNS-pinned HTTPS requests, bounded HTML and same-origin CSS. A screenshot can supplement script-heavy pages. Claude proposes validated design fields, never executable code. The user applies a proposal, can undo the last twenty AI changes, and can name/save its design to the studio’s template list. Templates carry design values, not borrowed photographs or text. Draft saving and public publishing remain separate.

The reference interpreter uses the supported editorial, campaign and image-journal renderers. It is not a pixel-exact site cloner or an arbitrary-code agent. Current controls include palette, type pairing, header, hero treatment, grid columns/gap, full-photo/fill treatment and logo size. Manual controls remain available. Template removal is saved on Save draft.

Logo processing uses Sharp to derive masks without redrawing the mark. The user approves black/white/icon variants. Wide wordmarks require checking the suggested left-side icon crop or uploading a separate square mark.

Opening: up to eight studio assets, 1–6 seconds each, capped at fifteen seconds total. Default twelve-second arrangement. Claude can view resized photo previews and propose pacing/order/crops; it does not inspect video frames or track live social trends. Three curated styles: editorial cuts, graphic locked shots and quiet cinema with short fades. The timing preview approximates the edit; encoded review is authoritative. Vimeo embeds need a direct source MP4.

FFmpeg encodes 24fps H.264 yuv420p, faststart, no audio, 1280×720 and 720×1280. Network input is downloaded with bounded DNS-pinned requests; FFmpeg sees local files and restricted demuxers/protocols. Native ffmpeg-static binary must be included in Vercel’s render function. Render timeout is 300 seconds; no durable background queue is promised. New encodes have immutable UUID names. Draft files are private in studio-originals, with short-lived signed previews. Explicit publication copies files to studio-web-assets; previously published URLs remain public after unpublishing (as with downloaded public assets).

Apply migrations 202611260003, 202611260004 and 202611260005 before deployment. Studio roles and storage paths enforce workspace isolation. AI requests have a durable eight-second interval and 120-per-studio daily ceiling, separate from import cooldowns. Model access and API credit remain requirements on the Anthropic account.

Validation: unit tests for sanitisation, template persistence, timing, render invalidation, reference digests and logo masks; all existing regression tests. Run typecheck/build. Test native encoding and inspect both output sizes. Verify production API access through the signed-in UI without saving/publishing customer changes.

Migration 202611260005 fixes a legacy private-storage name binding: a bare name inside the workspace lookup resolved to the workspace name rather than the storage object path. The correction qualifies storage.objects.name and preserves the intended access scope.
