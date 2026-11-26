import { NextResponse } from 'next/server';
import { syncStravaStats, writeCachedStats, readCachedStats } from '../../../../lib/strava';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/strava/sync
 *
 * Protected sync path. Sends Authorization: Bearer <STRAVA_SYNC_SECRET>
 * (or ?secret= for simple cron callers).
 *
 * Writes data/strava-stats.json when the filesystem is writable
 * (local / persistent hosts). On ephemeral serverless hosts, commit the
 * file from `npm run sync:strava` instead — see docs.
 */
export async function POST(request) {
  const configured = process.env.STRAVA_SYNC_SECRET;
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: 'STRAVA_SYNC_SECRET is not configured' },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const header = request.headers.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const querySecret = url.searchParams.get('secret') || '';
  const provided = bearer || querySecret;

  if (provided !== configured) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await syncStravaStats();
    return NextResponse.json({
      ok: true,
      syncedAt: stats.syncedAt,
      ytdRuns: stats.totals?.ytd?.count ?? 0,
      ytdMiles: stats.meta?.ytdDistanceMiles ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    try {
      const previous = await readCachedStats();
      await writeCachedStats({ ...previous, error: message });
    } catch {
      // ignore write failures on read-only FS
    }
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Use POST with STRAVA_SYNC_SECRET' },
    { status: 405 }
  );
}
