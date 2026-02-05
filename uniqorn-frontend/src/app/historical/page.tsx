import Link from 'next/link';

import { getAvailableSeasons, getSeasonLeaders } from '@/lib/data';

export default async function Page({
  searchParams
}: {
  searchParams?: { season?: string };
}) {
  const seasons = await getAvailableSeasons();
  const selectedSeason = searchParams?.season && seasons.includes(searchParams.season)
    ? searchParams.season
    : seasons.at(-1);

  const leaders = selectedSeason ? await getSeasonLeaders(selectedSeason, 50) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-sky-100">Historical</h1>
      <p className="text-sm text-zinc-300">
        Browse season leaders (top 50) by selecting a season.
      </p>

      <div className="flex flex-wrap gap-2">
        {seasons.map((s) => {
          const active = s === selectedSeason;
          return (
            <Link
              key={s}
              href={`/historical?season=${encodeURIComponent(s)}`}
              className={
                active
                  ? 'rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-100'
                  : 'rounded-full border border-zinc-800/70 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-200 hover:border-sky-500/30 hover:text-sky-100'
              }
            >
              {s}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-sky-500/20 bg-zinc-950/40">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-left text-zinc-200">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Games</th>
              <th className="px-4 py-3 text-right">Avg Uniqorn</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((row, i) => (
              <tr key={`${row.personId}-${row.season}-${i}`} className="border-t border-zinc-800/70 hover:bg-sky-500/5">
                <td className="px-4 py-3 text-zinc-300">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link 
                    href={`/player/${encodeURIComponent(row.firstName + ' ' + row.lastName)}`}
                    className="font-medium text-zinc-50 hover:text-sky-300 transition-colors"
                  >
                    {row.firstName} {row.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-zinc-300">{row.games}</td>
                <td className="px-4 py-3 text-right font-semibold text-sky-100">
                  {Number(row.avg_weighted_uniqueness).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
