# Magnolia Sales Workspace

Professional sales lead dashboard adapted from the supplied Magnolia Pipeline artifact. The existing marketing website is separate and has not been modified.

## Included

- Overview: opportunities, quotes awaiting decisions, won jobs, closed-lead win rate, follow-ups, outreach and recent activity.
- Today, pipeline board, searchable lead directory, contact records, call logging and outreach templates.
- Automatic follow-up dates after logged contact; dates use America/Chicago.
- Browser changes save to a private Netlify backend. Visible tabs check for cloud updates every 15 seconds. This is status tracking, not automatic outreach or lead discovery.
- CSV import/export plus a full JSON backup of leads, activity, templates and removed records. CSV migration preserves stages and follow-up dates; it does not migrate activity histories or templates from Claude.
- Removed cloud records are retained in the backend's trash for recovery. A recovery UI is not included.
- Password-protected data API, secure one-day sign-in cookies, same-origin writes, and conditional storage updates to avoid overwriting concurrent saves.

## Deploy on Netlify

1. Put this folder in a GitHub repository, or in a new dedicated folder in an existing repository.
2. Import that repository in Netlify. If nested, select this folder as the base directory. Build: `npm run build`. Publish: `public`. Functions: `netlify/functions` (already configured in netlify.toml).
3. In Netlify environment variables, create `DASHBOARD_PASSWORD`, with a unique strong password of at least 16 characters, scoped to Functions. Enter it directly in Netlify; do not put it in source code or chat.
4. Deploy and sign in to the new dashboard. Use a separate site from magnoliacleans.netlify.app.
5. Export existing leads from the original Claude artifact and import the CSV in this dashboard.

Netlify Blobs is accessed using the Function's environment; no storage credentials go to the browser. Configure Git-connected continuous deployment so future repository updates deploy automatically. Netlify charges and usage limits depend on the account; this package does not subscribe to a paid service.

This is a single-owner workspace. Team permissions and per-person sign-in are not implemented. The original Claude user service has been replaced with the owner identity.

## Local preview

Run `python -m http.server 8092 --directory public` and open http://localhost:8092. Local preview stores changes in that browser only. It does not sync to the deployed workspace. The separate HTML preview file is also local-only.

## Verification

`npm install`, `npm run build`, `npm test`.

Seven tests passed. Tests cover the lead creation → conversation → won workflow, authentication, missing configuration, protected cookies, same-origin enforcement, mutation validation, concurrent write retries, and preservation of removed records. Cloud operations are tested with a mock Blob store. A real Netlify deployment and live cloud sync still require account access and deployment verification.

## Existing data and integrations

The supplied HTML contains app code, not the stored Claude lead records. No leads, client names, results, or business statistics have been invented. No Metricool or TikTok metrics are displayed: this dashboard tracks sales, as the source artifact does. It does not send emails/texts or place calls automatically.
