import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
export const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export const EMPTY_STATS = {
  syncedAt: null,
  athlete: null,
  totals: null,
  recentActivities: [],
  error: null,
};

export function getStatsPath() {
  return path.join(process.cwd(), 'data', 'strava-stats.json');
}

export async function readCachedStats() {
  try {
    const raw = await readFile(getStatsPath(), 'utf8');
    return { ...EMPTY_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STATS };
  }
}

export async function writeCachedStats(stats) {
  const filePath = getStatsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
  return stats;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function refreshAccessToken() {
  const clientId = requireEnv('STRAVA_CLIENT_ID');
  const clientSecret = requireEnv('STRAVA_CLIENT_SECRET');
  const refreshToken = requireEnv('STRAVA_REFRESH_TOKEN');

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strava token refresh failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Strava token refresh returned no access_token');
  }

  return data;
}

async function stravaGet(pathname, accessToken, searchParams) {
  const url = new URL(`${STRAVA_API_BASE}${pathname}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value != null) url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strava GET ${pathname} failed (${response.status}): ${body}`);
  }

  return response.json();
}

function metersToMiles(meters) {
  return meters / 1609.344;
}

function formatActivity(activity) {
  return {
    id: activity.id,
    name: activity.name,
    type: activity.type,
    sportType: activity.sport_type,
    distanceMeters: activity.distance ?? 0,
    movingTimeSeconds: activity.moving_time ?? 0,
    elevationGainMeters: activity.total_elevation_gain ?? 0,
    startDate: activity.start_date_local || activity.start_date,
  };
}

function pickRunTotals(bucket) {
  return {
    count: bucket?.count ?? 0,
    distanceMeters: bucket?.distance ?? 0,
    movingTimeSeconds: bucket?.moving_time ?? 0,
    elevationGainMeters: bucket?.elevation_gain ?? 0,
  };
}

/**
 * Fetch athlete profile, run totals, and recent activities; shape for public display.
 * Tokens stay server-side — never return them.
 */
export async function fetchStravaStats() {
  const token = await refreshAccessToken();
  const accessToken = token.access_token;

  const athlete = await stravaGet('/athlete', accessToken);
  const stats = await stravaGet(`/athletes/${athlete.id}/stats`, accessToken);
  const activities = await stravaGet('/athlete/activities', accessToken, {
    per_page: 8,
    page: 1,
  });

  return {
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
    recentActivities: (activities || []).map(formatActivity),
    error: null,
    // Convenience display helpers for the page (derived, not secrets)
    meta: {
      distanceUnit: 'mi',
      ytdDistanceMiles: metersToMiles(stats.ytd_run_totals?.distance ?? 0),
      allDistanceMiles: metersToMiles(stats.all_run_totals?.distance ?? 0),
    },
  };
}

export async function syncStravaStats() {
  const stats = await fetchStravaStats();
  await writeCachedStats(stats);
  return stats;
}
