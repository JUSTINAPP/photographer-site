# Social and marketing workspace

The week, month, list and suggestion-card components are ported from the VSB Group dashboard. Calendar dates retain its Monday-first, six-week month and 06:00–22:00 hour-grid behaviour. Times outside the grid are clamped into edge rows so no saved posts disappear. The visual utilities are compiled into `src/app/social-calendar.css` and scoped to `.social-calendar`; Fresnel keeps its existing cream/navy navigation.

Existing `studio_schedule` rows are reused, including draft and manually posted items. The `details` object stores format, carousel ordering and creative direction. No VSB venue records or credentials are copied. Media remains in the existing studio library.

Ideas, pillars, guidelines, reviews and non-secret account identifiers use `studio_growth_records`. Its policies follow the existing owner/admin/social roles, including expiring platform support. Only a platform admin can assign Google property identifiers, preventing a studio owner from substituting another customer's property accessible to a shared reporting account. Tokens and private keys must never be stored here or returned to clients.

## Reporting configuration

Search Console and GA4 use the same server-side reporting implementation as VSB. Set `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in the deployment environment (the legacy `GOOGLE_SEARCH_CONSOLE_*` names are also supported). Use a dedicated Fresnel service account; enable the Search Console API and Google Analytics Data API. Each studio's owner must grant that reporting account access to the relevant Google property. A Fresnel platform admin then saves the exact Search Console identifier or numeric GA4 property ID on that studio's Marketing page. The Google token is minted on the server; requests have a 15-second timeout. Missing configuration and denied access show a setup message rather than sample statistics.

Google Business and Ads currently provide setup guidance and links to their Google dashboards, matching the unconfigured state of the corresponding VSB reference pages. Live reporting needs Business Profile approval / Google Ads API credentials and account authorisation. Instagram insights likewise need an authorised professional account. Fresnel shows actual saved post totals separately from unavailable network metrics.

Scheduling records a manual-posting reminder. This change does not silently enable an external publisher or cron job. The reference's Meta publisher is tied to VSB venue credentials and must be adapted only after each photographer authorises their social account.

## Validation

`npm test` covers calendar boundaries and existing studio behaviour; `npm run build` validates all routes. Database checks additionally exercised all migrations, new record isolation, admin-only property setup and support revocation against a disposable PostgreSQL-compatible database.
