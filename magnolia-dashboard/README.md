# Magnolia sales dashboard

Standalone private dashboard. Deploy a **separate Netlify project** from GitHub `bashar9314/gold-final`, branch `magnolia-site`, base `magnolia-dashboard`. Build `npm run build`; publish `public`; Functions `netlify/functions`. Do not change the marketing website or the root index.html.

Create DASHBOARD_PASSWORD in Netlify (Functions scope), at least 16 characters, before the production deployment. Enter secrets directly in Netlify. The data API refuses access if it is missing. Sign in at the dashboard, then use Restore backup to merge the recovered owner JSON. Never put lead lists or owner backups under public/ or in GitHub. Existing cloud records are preserved by ID and a pre-import snapshot is kept.

## What works

Overview, Today, searchable/filterable leads, pipeline drag-and-drop on desktop and stage selection on phones, contact editing, one-click call outcomes, notes, history, follow-up dates, templates, CSV import/export, full JSON backup/merge, and cloud sync. Call outcomes and their lead updates save in one transaction. Browser preview saves only to that browser; production uses authenticated Netlify Blobs. Deletes are retained in trash. The app never sends outreach automatically. Missing business email is blank.

Install on iPhone from Safari: Share → Add to Home Screen. Android: Chrome menu → Add to Home screen. An internet connection is needed to save. Service workers do not cache private lead data.

## Daily leads

Target: 10–15 new general contractors/home builders within 40 miles of Southaven, MS. A daily Netlify scheduled function runs at 13:00 UTC (8am CDT / 7am CST). **Discovery is not active until a real source is connected.** Configure LEAD_FEED_URL (HTTPS JSON feed) and optionally LEAD_FEED_TOKEN in Functions environment variables. The source provider must supply researched business records; this importer does not search the web itself. No paid provider has been subscribed to or configured.

Feed response: `{"leads":[{"company":"real business name","segment":"General Contractor","source":"https://official-source/page","latitude":34.99,"longitude":-90.01,"phone":"","email":"","website":""}]}`. Home Builder is also accepted. Company, HTTPS source and coordinates are required. Unknown contacts stay blank. The importer validates location, deduplicates company names including removed records, preserves existing edits, and adds at most 15 a day. The UI shows actual daily additions and reports setup needed, below-target results, or errors. It cannot guarantee 10–15 valid new businesses indefinitely in a finite service area.

## Verify

`npm ci --ignore-scripts`, `npm run build`, `npm test`. Tests cover authentication, validation, cloud conflict retries, merged imports, atomic call logging, sourced geographic filtering, and the add → conversation → won flow. The actual deployed backend must also be verified after its password is configured.
