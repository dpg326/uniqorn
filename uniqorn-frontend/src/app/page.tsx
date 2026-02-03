import Link from 'next/link';

import { getCurrentSeasonLeaders, getRecentUniqornGames, getMostRecentUltimateUniqorn, safeChartFileName } from '@/lib/data';

export default async function Page() {
  const [leaders, recent, mostRecentUltimate] = await Promise.all([
    getCurrentSeasonLeaders(),
    getRecentUniqornGames(),
    getMostRecentUltimateUniqorn(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <p className="text-sm text-zinc-400 max-w-4xl mx-auto">
          The Uniqorn Index measures how statistically unique a player's performance is by bucketing 
          points, assists, rebounds, blocks, and steals into ranges, then calculating how rare that combination 
          occurs within a season. Higher values indicate rarer statistical performances.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content - League Leaders */}
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
                <h2 className="text-xl font-semibold text-sky-200">League Leaders (Season Uniqorn)</h2>
                <p className="text-sm text-zinc-300 mt-1">
                  Highest average weighted uniqueness by season
                </p>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-700">
                      <tr className="text-left text-zinc-200">
                        <th className="px-4 py-3 font-medium">Rank</th>
                        <th className="px-4 py-3 font-medium">Player</th>
                        <th className="px-4 py-3 font-medium">Season</th>
                        <th className="px-4 py-3 font-medium text-right">Games</th>
                        <th className="px-4 py-3 font-medium text-right">Avg Uniqorn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {leaders.map((row, i) => (
                        <tr
                          key={`${row.personId}-${row.season}`}
                          className="hover:bg-sky-400/10 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-400/20 text-sky-200 text-xs font-medium">
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-zinc-50">
                              {row.firstName} {row.lastName}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-300">{row.season}</td>
                          <td className="px-4 py-3 text-right text-zinc-300">{row.games}</td>
                          <td className="px-4 py-3 text-right font-semibold text-sky-300">
                            {Number(row.avg_weighted_uniqueness).toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Most Recent Ultimate Uniqorn */}
            {mostRecentUltimate && (
              <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 px-6 py-4">
                  <h3 className="text-lg font-semibold text-purple-200">Most Recent Ultimate Uniqorn</h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Rarest statistical combination in NBA history
                  </p>
                </div>
                <div className="p-6">
                  <div className="group cursor-pointer">
                    <Link href={`/charts/${safeChartFileName(mostRecentUltimate.firstName, mostRecentUltimate.lastName, mostRecentUltimate.game_date)}`}>
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-zinc-50">
                            {mostRecentUltimate.firstName} {mostRecentUltimate.lastName}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {mostRecentUltimate.game_date}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-400/20 text-purple-200">
                            {mostRecentUltimate.points} pts
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-400/20 text-purple-200">
                            {mostRecentUltimate.assists} ast
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-400/20 text-purple-200">
                            {mostRecentUltimate.rebounds} reb
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-400/20 text-purple-200">
                            {mostRecentUltimate.blocks} blk
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-400/20 text-purple-200">
                            {mostRecentUltimate.steals} stl
                          </span>
                        </div>
                        
                        <div className="text-center">
                          <span className="inline-flex items-center text-xs text-purple-300 group-hover:text-purple-200 transition-colors">
                            View Radar Chart →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Uniqorn Games */}
            <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-sky-200">Recent Uniqorn Games</h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Latest unique statistical performances this season
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recent.map((game) => (
                    <div key={`${game.firstName}-${game.lastName}-${game.game_date}`} className="group">
                      <Link href={`/charts/${game.chartFile}`}>
                        <div className="block p-4 rounded-xl border border-zinc-700/50 hover:border-sky-400/50 hover:bg-sky-400/10 transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-zinc-50 group-hover:text-sky-200 transition-colors">
                                {game.firstName} {game.lastName}
                              </div>
                              <div className="text-sm text-zinc-400 mt-1">
                                {game.game_date}
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-sky-200 opacity-0 group-hover:opacity-100 transition-opacity">
                              Chart →
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
                              {game.points} pts
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
                              {game.assists} ast
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
                              {game.rebounds} reb
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
                              {game.blocks} blk
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
                              {game.steals} stl
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}
