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

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const statsPath = path.join(root, 'data', 'strava-stats.json');

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

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

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function metersToMiles(meters) {
  return meters / 1609.344;
}

function pickRunTotals(bucket) {
  return {
    count: bucket?.count ?? 0,
    distanceMeters: bucket?.distance ?? 0,
    movingTimeSeconds: bucket?.moving_time ?? 0,
    elevationGainMeters: bucket?.elevation_gain ?? 0,
  };
}

async function refreshAccessToken() {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: requireEnv('STRAVA_CLIENT_ID'),
      client_secret: requireEnv('STRAVA_CLIENT_SECRET'),
      grant_type: 'refresh_token',
      refresh_token: requireEnv('STRAVA_REFRESH_TOKEN'),
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.access_token) throw new Error('No access_token in refresh response');
  return data.access_token;
}

async function stravaGet(pathname, accessToken, searchParams) {
  const url = new URL(`${STRAVA_API_BASE}${pathname}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`GET ${pathname} failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  await loadDotEnv();
  console.log('Refreshing Strava access token…');
  const accessToken = await refreshAccessToken();

  console.log('Fetching athlete, stats, and recent activities…');
  const athlete = await stravaGet('/athlete', accessToken);
  const stats = await stravaGet(`/athletes/${athlete.id}/stats`, accessToken);
  const activities = await stravaGet('/athlete/activities', accessToken, {
    per_page: 8,
    page: 1,
  });

  const payload = {
    syncedAt: new Date().toISOString(),
    athlete: {
      id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      city: athlete.city || null,
      state: athlete.state || null,
      country: athlete.country || null,
    },
    totals: {
      ytd: pickRunTotals(stats.ytd_run_totals),
      all: pickRunTotals(stats.all_run_totals),
      recent: pickRunTotals(stats.recent_run_totals),
    },
    recentActivities: (activities || []).map((activity) => ({
      id: activity.id,
      name: activity.name,
      type: activity.type,
      sportType: activity.sport_type,
      distanceMeters: activity.distance ?? 0,
      movingTimeSeconds: activity.moving_time ?? 0,
      elevationGainMeters: activity.total_elevation_gain ?? 0,
      startDate: activity.start_date_local || activity.start_date,
    })),
    error: null,
    meta: {
      distanceUnit: 'mi',
      ytdDistanceMiles: metersToMiles(stats.ytd_run_totals?.distance ?? 0),
      allDistanceMiles: metersToMiles(stats.all_run_totals?.distance ?? 0),
    },
  };

  await mkdir(path.dirname(statsPath), { recursive: true });
  await writeFile(statsPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${statsPath}`);
  console.log(
    `YTD: ${payload.totals.ytd.count} runs, ${payload.meta.ytdDistanceMiles.toFixed(1)} mi`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
