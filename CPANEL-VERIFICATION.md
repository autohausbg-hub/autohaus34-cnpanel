# cPanel preparation: verification record

Date: 2026-10-08. Source: `Nikichh1/autohaus34`,
`82bf95aa000d2a8925afca2470d87e367bce47de`.

| Requirement | State | Evidence |
|---|---|---|
| Node.js 22/24 runtime, Passenger startup | IMPLEMENTED_NOT_VERIFIED | `app.js`; Node 24 local startup verified. Real Passenger account not tested. |
| Original routes, protected admin and same-origin JSON | VERIFIED | 17 cPanel HTTP/package tests, including original real handlers with mocked provider responses. |
| Supabase session cookies, active roles and RLS bearer context | VERIFIED | HTTP login/settings tests + existing backend regression tests. Fixtures only, no real staff login. |
| Existing Supabase database / Storage preservation | VERIFIED | No production migrations, data imports or reset performed; existing helpers unchanged. |
| Public assets only, no backend/secret/SQL HTTP exposure | VERIFIED | Traversal/private-path tests; production origin/host validation. |
| Brotli/gzip, HTTP cache, HEAD, ETag | VERIFIED | Lossless compression tests + HTTP request tests. |
| Existing design / admin regressions | VERIFIED | `npm test`: 150 passing tests. |
| Isolated PostgreSQL schema / permissions | VERIFIED | `npm run test:database`: 4 passing suites with in-memory PGlite. No external DB. |
| Photo/UI regressions | VERIFIED | `node --test tools/public-cleanup.test.js`: 13 passing tests. |
| Syntax, inventory fixture and public references | VERIFIED | `npm run check`: 177 JS syntax checks; 84 fixture cars, 634 photos × 6 variants. |
| Runtime archive | VERIFIED | `npm run package:cpanel`; allowlisted startup/backend/dist and `tmp/restart.txt`; no `.env`, Git or SQL. |
| Local browser startup | VERIFIED | Anonymous `/admin` redirects to login; public layout loads with mocked server fetch responses. No real admin writes. |
| Namecheap / SuperHosting deployment, TLS and limits | NOT_STARTED | Requires the actual cPanel hosting account and separate staging URL. |
| Real staff login / Storage upload / mail / translator | NOT_STARTED | Local mock success does not confirm external services. |
| Old PHP system and email migration | NOT_STARTED | Not included in this GitHub project; do not cancel existing hosting. |
| Production DNS cutover / operator acceptance | NOT_STARTED | No DNS change or live hosting deployment performed. |

Optional tooling (`sharp`, `@electric-sql/pglite`) was available locally for
isolated tests; it is not needed by the deployed runtime. Existing SQL migration
files are unchanged. The old source-specific staging workflow is removed in
this separate repository, not in the original repository. Git history retains it.

The archive contains legacy inventory/equipment only as private runtime input
for the existing admin sync code; it is not a Supabase backup or a public fallback.
Keep the application directory outside the public document root.
