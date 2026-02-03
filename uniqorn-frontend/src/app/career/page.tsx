import { getAllTimeLeaders } from '@/lib/data';

export default async function Page() {
  const leaders = await getAllTimeLeaders(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-sky-100">Top 50 Career</h1>
      <p className="text-sm text-zinc-300">
        All-time leaders based on the mean of season-level average weighted uniqueness.
      </p>

      <div className="overflow-hidden rounded-xl border border-sky-500/20 bg-zinc-950/40">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-left text-zinc-200">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Total Games</th>
              <th className="px-4 py-3 text-right">Avg Uniqorn</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((row, i) => (
              <tr key={String(row.personId)} className="border-t border-zinc-800/70 hover:bg-sky-500/5">
                <td className="px-4 py-3 text-zinc-300">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-50">
                    {row.firstName} {row.lastName}
                  </div>
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
