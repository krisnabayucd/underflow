# Underflow source update · 12 October 2026

Source matches deployed commit 76016e048f90227cba15f07f983c8b209bb9278a.
This handover adds this guide and a change log, cleans up README wording, and
excludes generated TypeScript build metadata. Application source is unchanged.

## Update your existing GitHub repository

1. Open your existing local Underflow repository in File Explorer, then open Git Bash there.
2. Run `git status`. If you have your own uncommitted changes, save/commit them before replacing files.
3. Run `git pull --ff-only` to get existing remote changes. Stop if this fails.
4. Extract the ZIP elsewhere. Copy everything inside its Underflow folder into your existing repository folder. Accept file replacements. Keep your existing .git folder; this ZIP contains no .git directory. Include dotfiles such as .gitignore and the .openai directory.
5. In Git Bash run:

```bash
git status
git add .
git commit -m "Update radar signals, source fallback, and dashboard copy"
git push
```

Review git status before staging; it should show only changes you intend to upload.
If push says your branch has no upstream, run:

```bash
git push -u origin HEAD
```

If push is rejected because remote changes exist, do not force-push.
Keep the error text and resolve the remote changes before trying again.
If origin is missing, this is not yet a connected repository: use your existing
clone, or configure the actual repo URL with git remote add origin.

Pushing to GitHub stores the source. It does not automatically update the hosted
Sites dashboard. The current hosted dashboard already includes these changes.

## Included changes

See CHANGELOG.md. README.md covers data providers, scoring, evidence rules,
source retention, limitations and the update endpoint.

## Project map

| Path | Purpose |
| --- | --- |
| app/page.tsx | Dashboard, filters, explanations and visit comparisons |
| app/globals.css, app/signals.css | Existing styling and compact signal UI |
| app/api/radar/route.ts | GET saved snapshot; POST refresh and save |
| lib/collect.ts | Public protocol, reference-token and RPC adapters |
| lib/signals.ts | Baseline checks, score explanations and fallback |
| lib/enrich.ts | Daily fee history and verified address registry |
| lib/storage.ts | Compressed snapshot encoding; old JSON compatibility |
| db/schema.ts | Snapshots and enrichment cache tables |
| drizzle/ | Database migrations; do not edit already applied migrations |
| tests/ | Metric mapping, signal and storage checks |
| .openai/hosting.json | Existing Sites project identity and database binding |

## Database update

Migration 0001_burly_gressill.sql creates enrichment_cache, required by the
new updater. It is already deployed on the existing Site. Another deployment
must apply all pending migrations to its own database before using the updater.
Do not delete the existing snapshots table or reset the database.

## Development and hosting

Use the Node requirement and pnpm version in package.json and the supplied
pnpm-lock.yaml. The current app targets Sites on Cloudflare Workers with D1.
It is not a static GitHub Pages app. GitHub upload does not require installing
Node, dependencies, or running the app.

For a configured development environment, dependency installation uses
pnpm install --frozen-lockfile. Run pnpm exec tsc --noEmit for type checking.
On Node 22 with experimental type stripping, or newer supported Node:

```bash
node --experimental-strip-types tests/metrics.mjs
node --experimental-strip-types tests/signals.mjs
```

Build through the Sites workflow described in README.md. Windows-native build
and external hosting portability have not been verified. Cloudflare database
bindings and Sites authentication must be configured for a separate deployment.
No private service tokens, runtime secrets, live database, wallet information,
node_modules, or Git history are included.

## Refresh contract

GET /api/radar returns the latest saved snapshot or {empty:true}.
POST /api/radar fetches provider data and persists a new snapshot, with a
five-minute cooldown that may return the existing snapshot. A caller can
compare POST's at timestamp to a following GET's at timestamp.
Private service access is provided by Sites; never commit its bearer token.
Retained source data has its original success timestamp and a stale label.
HTTP 503 means storage or refresh failed. Provider gaps do not imply zero activity.

The linked four-hour refresh belongs to the current hosted Site. It is not
a GitHub Action and will not be installed just by copying this source.

## Verification

Production builds passed for the feature update and the wording cleanup.
Metric, baseline, source-retention, visit-comparison and compression checks
passed for the feature update. Live POST/GET timestamps matched afterward.
Browser visual QA was unavailable. Provider coverage remains partial.
