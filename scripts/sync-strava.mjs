#!/usr/bin/env node
/**
 * Sync Strava stats into data/strava-stats.json
 *
 * Requires env vars:
 *   STRAVA_CLIENT_ID
 *   STRAVA_CLIENT_SECRET
 *   STRAVA_REFRESH_TOKEN
 *
 * Optional: load from .env.local if present (no dependency).
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    try {
      const raw = await readFile(path.join(root, name), 'utf8');
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
      }
    } catch {
      // file optional
    }
  }
}

async function main() {
  await loadDotEnv();
  // Ensure lib helpers resolve data/ relative to the repo root
  process.chdir(root);

  console.log('Syncing Strava stats…');
  const { syncStravaStats } = await import('../lib/strava.js');
  const payload = await syncStravaStats();

  const ytd = payload.totals?.ytd;
  const counts = payload.activityCounts;
  const prs = payload.personalRecords || [];
  const prFetch = payload.meta?.prFetch;

  console.log(`Wrote data/strava-stats.json`);
  console.log(
    `YTD runs: ${ytd?.count ?? 0}, ${(payload.meta?.ytdDistanceMiles ?? 0).toFixed(1)} mi`
  );
  console.log(
    `Counts YTD — run ${counts?.ytd?.run ?? 0}, ride ${counts?.ytd?.ride ?? 0}, hiit ${counts?.ytd?.hiit ?? 0}`
  );
  console.log(
    `Counts all — run ${counts?.all?.run ?? 0}, ride ${counts?.all?.ride ?? 0}, hiit ${counts?.all?.hiit ?? 0}`
  );
  console.log(`Personal records: ${prs.length}`);
  if (prFetch) {
    console.log(
      `PR details fetched ${prFetch.fetched}, skipped cached ${prFetch.skippedCached}, pending ${prFetch.pending}${prFetch.truncated ? ' (truncated by rate budget)' : ''}`
    );
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
