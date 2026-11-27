import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
export const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

/** Leave headroom under Strava's ~100 req / 15 min overall limit. */
const MAX_DETAIL_FETCHES_PER_SYNC = 85;
const ACTIVITIES_PER_PAGE = 100;
const MAX_ACTIVITY_PAGES = 20;
const RECENT_ACTIVITY_LIMIT = 8;

export const RUN_SPORT_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);
export const RIDE_SPORT_TYPES = new Set([
  'Ride',
  'VirtualRide',
  'EBikeRide',
  'MountainBikeRide',
  'GravelRide',
]);
export const HIIT_SPORT_TYPES = new Set(['HighIntensityIntervalTraining']);

export const EMPTY_STATS = {
  syncedAt: null,
  athlete: null,
  totals: null,
  activityCounts: null,
  personalRecords: [],
  recentActivities: [],
  error: null,
  meta: null,
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

export function classifySportType(sportType, fallbackType) {
  const sport = sportType || fallbackType || '';
  if (RUN_SPORT_TYPES.has(sport)) return 'run';
  if (RIDE_SPORT_TYPES.has(sport)) return 'ride';
  if (HIIT_SPORT_TYPES.has(sport)) return 'hiit';
  return 'other';
}

function emptyTypeCounts() {
  return { run: 0, ride: 0, hiit: 0, other: 0 };
}

function yearStartIso(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1).toISOString();
}

async function listAllActivities(accessToken) {
  const activities = [];
  for (let page = 1; page <= MAX_ACTIVITY_PAGES; page += 1) {
    const batch = await stravaGet('/athlete/activities', accessToken, {
      per_page: ACTIVITIES_PER_PAGE,
      page,
    });
    if (!Array.isArray(batch) || batch.length === 0) break;
    activities.push(...batch);
    if (batch.length < ACTIVITIES_PER_PAGE) break;
  }
  return activities;
}

function countActivitiesByType(activities, now = new Date()) {
  const ytdCutoff = yearStartIso(now);
  const ytd = emptyTypeCounts();
  const all = emptyTypeCounts();

  for (const activity of activities) {
    const bucket = classifySportType(activity.sport_type, activity.type);
    all[bucket] += 1;
    const start = activity.start_date_local || activity.start_date || '';
    if (start >= ytdCutoff) ytd[bucket] += 1;
  }

  return { ytd, all };
}

function normalizeEffort(effort, activity) {
  return {
    name: effort.name,
    distanceMeters: effort.distance ?? 0,
    elapsedTimeSeconds: effort.elapsed_time ?? null,
    movingTimeSeconds: effort.moving_time ?? effort.elapsed_time ?? null,
    startDate: effort.start_date_local || effort.start_date || activity.start_date_local || activity.start_date || null,
    activityId: activity.id,
  };
}

function isBetterEffort(candidate, current) {
  if (!current) return true;
  const candidateTime = candidate.movingTimeSeconds ?? candidate.elapsedTimeSeconds;
  const currentTime = current.movingTimeSeconds ?? current.elapsedTimeSeconds;
  if (candidateTime == null) return false;
  if (currentTime == null) return true;
  if (candidateTime !== currentTime) return candidateTime < currentTime;
  // Stable tie-break: prefer newer effort
  return String(candidate.startDate || '') > String(current.startDate || '');
}

function mergePersonalRecords(existingRecords, newRecords) {
  const byName = new Map();
  for (const record of [...(existingRecords || []), ...(newRecords || [])]) {
    if (!record?.name) continue;
    const current = byName.get(record.name);
    if (isBetterEffort(record, current)) byName.set(record.name, record);
  }
  return Array.from(byName.values()).sort(
    (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)
  );
}

function extractPrEfforts(detail) {
  const efforts = Array.isArray(detail?.best_efforts) ? detail.best_efforts : [];
  return efforts
    .filter((effort) => effort && effort.pr_rank === 1)
    .map((effort) => normalizeEffort(effort, detail));
}

/**
 * Fetch run details for PRs, skipping ids already inspected.
 * Returns updated personalRecords + inspected id set.
 */
async function collectPersonalRecords(accessToken, runActivities, previousStats) {
  const previousRecords = previousStats?.personalRecords || [];
  const inspected = new Set(
    (previousStats?.meta?.prInspectedActivityIds || []).map((id) => Number(id))
  );

  const orderedRuns = [...runActivities].sort((a, b) => {
    const aDate = a.start_date_local || a.start_date || '';
    const bDate = b.start_date_local || b.start_date || '';
    return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
  });

  const newlyFound = [];
  let fetched = 0;
  let skippedCached = 0;
  let truncated = false;

  for (const activity of orderedRuns) {
    const id = Number(activity.id);
    if (inspected.has(id)) {
      skippedCached += 1;
      continue;
    }
    if (fetched >= MAX_DETAIL_FETCHES_PER_SYNC) {
      truncated = true;
      break;
    }

    const detail = await stravaGet(`/activities/${id}`, accessToken);
    fetched += 1;
    inspected.add(id);
    newlyFound.push(...extractPrEfforts(detail));
  }

  return {
    personalRecords: mergePersonalRecords(previousRecords, newlyFound),
    prInspectedActivityIds: Array.from(inspected).sort((a, b) => a - b),
    prFetch: {
      fetched,
      skippedCached,
      pending: truncated
        ? orderedRuns.filter((a) => !inspected.has(Number(a.id))).length
        : 0,
      truncated,
    },
  };
}

/**
 * Fetch athlete profile, totals, activity-type counts, PRs, and recent activities.
 * Tokens stay server-side — never return them.
 */
export async function fetchStravaStats(previousStats = null) {
  const prior = previousStats || (await readCachedStats());
  const token = await refreshAccessToken();
  const accessToken = token.access_token;

  const athlete = await stravaGet('/athlete', accessToken);
  const stats = await stravaGet(`/athletes/${athlete.id}/stats`, accessToken);
  const activities = await listAllActivities(accessToken);
  const activityCounts = countActivitiesByType(activities);
  const recentActivities = activities.slice(0, RECENT_ACTIVITY_LIMIT).map(formatActivity);

  const runActivities = activities.filter((activity) =>
    RUN_SPORT_TYPES.has(activity.sport_type || activity.type)
  );
  const { personalRecords, prInspectedActivityIds, prFetch } = await collectPersonalRecords(
    accessToken,
    runActivities,
    prior
  );

  // Drop inspected ids for activities that no longer exist in the athlete feed
  // only after a full (non-truncated) pass, so partial syncs keep progress.
  const liveRunIds = new Set(runActivities.map((a) => Number(a.id)));
  const prunedInspected = prFetch.truncated
    ? prInspectedActivityIds
    : prInspectedActivityIds.filter((id) => liveRunIds.has(Number(id)));

  return {
    syncedAt: new Date().toISOString(),
    athlete: {
      id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      city: athlete.city || null,
      state: athlete.state || null,
      country: athlete.country || null,
      profileUrl: `https://www.strava.com/athletes/${athlete.id}`,
    },
    totals: {
      ytd: pickRunTotals(stats.ytd_run_totals),
      all: pickRunTotals(stats.all_run_totals),
      recent: pickRunTotals(stats.recent_run_totals),
    },
    activityCounts: {
      ytd: {
        run: activityCounts.ytd.run,
        ride: activityCounts.ytd.ride,
        hiit: activityCounts.ytd.hiit,
      },
      all: {
        run: activityCounts.all.run,
        ride: activityCounts.all.ride,
        hiit: activityCounts.all.hiit,
      },
    },
    personalRecords,
    recentActivities,
    error: null,
    meta: {
      distanceUnit: 'mi',
      ytdDistanceMiles: metersToMiles(stats.ytd_run_totals?.distance ?? 0),
      allDistanceMiles: metersToMiles(stats.all_run_totals?.distance ?? 0),
      prInspectedActivityIds: prunedInspected,
      prFetch,
      activityTypeOther: {
        ytd: activityCounts.ytd.other,
        all: activityCounts.all.other,
      },
    },
  };
}

export async function syncStravaStats() {
  const previous = await readCachedStats();
  const stats = await fetchStravaStats(previous);
  await writeCachedStats(stats);
  return stats;
}
