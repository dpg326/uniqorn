import { getAllTimeLeaders } from '@/lib/data';
import UniqornScore from '@/components/UniqornTooltip';

export default async function Page() {
  const leaders = await getAllTimeLeaders(50);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-sky-100">Top 50 Career Leaders</h1>
        <p className="text-sm md:text-base text-zinc-300">
          All-time leaders based on the mean of season-level average weighted uniqueness.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-sky-500/20 bg-zinc-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-zinc-900/60 text-left text-zinc-200">
              <tr>
                <th className="px-2 md:px-4 py-3">Rank</th>
                <th className="px-2 md:px-4 py-3">Player</th>
                <th className="px-2 md:px-4 py-3 text-right hidden sm:table-cell">Games</th>
                <th className="px-2 md:px-4 py-3 text-right">Avg Uniqorn</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((row, i) => (
                <tr key={String(row.personId)} className="border-t border-zinc-800/70 hover:bg-sky-500/5">
                  <td className="px-2 md:px-4 py-3 text-zinc-300">{i + 1}</td>
                  <td className="px-2 md:px-4 py-3">
                    <div className="font-medium text-zinc-50">
                      {row.firstName} {row.lastName}
                    </div>
                    <div className="text-xs text-zinc-400 sm:hidden">
                      {row.games > 0 ? `${row.games} games` : ''}
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-3 text-right text-zinc-300 hidden sm:table-cell">
                    {row.games > 0 ? row.games : '—'}
                  </td>
                  <td className="px-2 md:px-4 py-3">
                    <UniqornScore score={Number(row.avg_weighted_uniqueness)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
