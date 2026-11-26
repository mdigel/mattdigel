import { readCachedStats } from '../../lib/strava';

export const metadata = {
  title: 'Strava — Matt Digel',
  description: 'Selected Strava run stats.',
};

export const dynamic = 'force-dynamic';

function formatMiles(meters) {
  if (meters == null) return '—';
  const miles = meters / 1609.344;
  return miles >= 100 ? miles.toFixed(0) : miles.toFixed(1);
}

function formatHours(seconds) {
  if (seconds == null) return '—';
  const hours = seconds / 3600;
  if (hours < 10) return hours.toFixed(1);
  return Math.round(hours).toLocaleString();
}

function formatElevation(meters) {
  if (meters == null) return '—';
  const feet = meters * 3.28084;
  return Math.round(feet).toLocaleString();
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
}

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Stat({ label, value, unit }) {
  return (
    <div className="py-4 border-b border-border last:border-b-0 sm:border-b-0 sm:py-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-normal tracking-tight text-foreground tabular-nums">
        {value}
        {unit ? (
          <span className="text-sm text-gray-400 font-normal ml-1.5">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}

export default async function StravaPage() {
  const stats = await readCachedStats();
  const hasData = Boolean(stats.syncedAt && stats.totals);
  const ytd = stats.totals?.ytd;
  const all = stats.totals?.all;
  const activities = stats.recentActivities || [];

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-32 pb-20">
        <div className="max-w-2xl w-full">
          <h1 className="text-sm font-normal mb-2 leading-relaxed">Strava</h1>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed">
            A quiet look at time on feet — synced from Strava.
          </p>

          {!hasData ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground">Stats haven&apos;t been synced yet.</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {stats.error
                  ? `Last sync error: ${stats.error}`
                  : 'Once an initial sync runs, year-to-date and recent runs will show up here.'}
              </p>
            </div>
          ) : (
            <>
              <section className="mb-12" aria-label="Year to date">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-4">
                  Year to date
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-border pt-6">
                  <Stat label="Distance" value={formatMiles(ytd.distanceMeters)} unit="mi" />
                  <Stat label="Runs" value={(ytd.count ?? 0).toLocaleString()} />
                  <Stat label="Moving time" value={formatHours(ytd.movingTimeSeconds)} unit="hrs" />
                </div>
              </section>

              <section className="mb-12" aria-label="All time">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-4">
                  All time
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-border pt-6">
                  <Stat label="Distance" value={formatMiles(all.distanceMeters)} unit="mi" />
                  <Stat
                    label="Elevation"
                    value={formatElevation(all.elevationGainMeters)}
                    unit="ft"
                  />
                  <Stat label="Runs" value={(all.count ?? 0).toLocaleString()} />
                </div>
              </section>

              {activities.length > 0 ? (
                <section aria-label="Recent activities">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-4">
                    Recent
                  </p>
                  <ul className="border-t border-border">
                    {activities.map((activity) => (
                      <li
                        key={activity.id}
                        className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-4 border-b border-border"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{activity.name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(activity.startDate)}
                            {activity.sportType || activity.type
                              ? ` · ${activity.sportType || activity.type}`
                              : ''}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 tabular-nums sm:text-right shrink-0">
                          {formatMiles(activity.distanceMeters)} mi
                          <span className="text-gray-300 mx-2">·</span>
                          {formatDuration(activity.movingTimeSeconds)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <p className="text-xs text-gray-400 mt-10">
                Updated {formatDate(stats.syncedAt)}
                {' · '}
                <a
                  href="https://www.strava.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-gray-300 hover:decoration-gray-500 underline-offset-2"
                >
                  Data from Strava
                </a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
