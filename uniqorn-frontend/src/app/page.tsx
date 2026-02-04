import Link from 'next/link';

import { getCurrentSeasonLeaders, getRecentUniqornGames, getMostRecentUltimateUniqorn, safeChartFileName } from '@/lib/data';
import UltimateChartCard from '@/components/UltimateChartCard';
import RecentGameCard from '@/components/RecentGameCard';
import UniqornScore from '@/components/UniqornTooltip';

export default async function Page() {
  const [leaders, recent, mostRecentUltimate] = await Promise.all([
    getCurrentSeasonLeaders(),
    getRecentUniqornGames(),
    getMostRecentUltimateUniqorn(),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 py-8 md:py-12 overflow-hidden">
        {/* Decorative Background Chart */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <svg viewBox="0 0 400 400" className="w-full max-w-2xl h-auto">
            {/* Radar chart grid */}
            <g>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <circle
                  key={i}
                  cx="200"
                  cy="200"
                  r={20 + i * 20}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-sky-400"
                />
              ))}
              {/* Axes */}
              {[0, 72, 144, 216, 288].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x = 200 + Math.cos(rad - Math.PI / 2) * 180;
                const y = 200 + Math.sin(rad - Math.PI / 2) * 180;
                return (
                  <line
                    key={angle}
                    x1="200"
                    y1="200"
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-sky-400"
                  />
                );
              })}
              {/* Example data polygon */}
              <polygon
                points="200,80 280,140 260,280 140,280 120,140"
                fill="currentColor"
                fillOpacity="0.3"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-400"
              />
            </g>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              The Uniqorn Index
            </span>
            <br />
            <span className="text-zinc-50">
              Measuring Statistical Uniqueness
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
            Discover which players have the most distinctive statistical profiles in NBA history. 
            The Uniqorn Index ranks players by how unique their performances are—celebrating 
            the rare, the extreme, and the truly one-of-a-kind.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap justify-center gap-4 pt-4">
          <Link 
            href="/search" 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Search Stat Combinations
          </Link>
          <Link 
            href="/career" 
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            Top 50 All-Time
          </Link>
          <Link 
            href="/about" 
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-sky-200 font-semibold rounded-lg transition-all border border-sky-400/30"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Quick Explainer */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm p-4 md:p-6">
          <p className="text-sm md:text-base text-zinc-300 text-center">
            <span className="font-semibold text-sky-300">How it works:</span> We bucket every NBA game by points, assists, rebounds, blocks, and steals—then measure how unique that exact combination is within its season. Higher scores = more unique performances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          {/* Main Content - League Leaders */}
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-4 md:px-6 py-4">
                <h2 className="text-lg md:text-xl font-semibold text-sky-200">League Leaders (Season Uniqorn)</h2>
                <p className="text-xs md:text-sm text-zinc-300 mt-1">
                  Players with the most unique statistical profiles this season
                </p>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-xs md:text-sm">
                    <thead className="border-b border-zinc-700">
                      <tr className="text-left text-zinc-200">
                        <th className="px-2 md:px-4 py-3 font-medium">Rank</th>
                        <th className="px-2 md:px-4 py-3 font-medium">Player</th>
                        <th className="px-2 md:px-4 py-3 font-medium hidden sm:table-cell">Season</th>
                        <th className="px-2 md:px-4 py-3 font-medium text-right hidden md:table-cell">Games</th>
                        <th className="px-2 md:px-4 py-3 font-medium text-right">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {leaders.map((row, i) => (
                        <tr
                          key={`${row.personId}-${row.season}`}
                          className="hover:bg-sky-400/10 transition-colors"
                        >
                          <td className="px-2 md:px-4 py-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-400/20 text-sky-200 text-xs font-medium">
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-2 md:px-4 py-3">
                            <div className="font-medium text-zinc-50">
                              {row.firstName} {row.lastName}
                            </div>
                            <div className="text-xs text-zinc-400 sm:hidden">{row.season}</div>
                          </td>
                          <td className="px-2 md:px-4 py-3 text-zinc-300 hidden sm:table-cell">{row.season}</td>
                          <td className="px-2 md:px-4 py-3 text-right text-zinc-300 hidden md:table-cell">{row.games}</td>
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
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Most Recent Ultimate Uniqorn */}
            {mostRecentUltimate && (
              <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 px-4 md:px-6 py-4">
                  <h3 className="text-base md:text-lg font-semibold text-purple-200">Most Recent Ultimate Uniqorn</h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Most unique statistical combination in NBA history
                  </p>
                </div>
                <div className="p-4 md:p-6">
                  <UltimateChartCard
                    firstName={mostRecentUltimate.firstName}
                    lastName={mostRecentUltimate.lastName}
                    game_date={mostRecentUltimate.game_date}
                    points={mostRecentUltimate.points}
                    assists={mostRecentUltimate.assists}
                    rebounds={mostRecentUltimate.rebounds}
                    blocks={mostRecentUltimate.blocks}
                    steals={mostRecentUltimate.steals}
                    opponentteamName={mostRecentUltimate.opponentteamName}
                  />
                </div>
              </div>
            )}

            {/* Recent Uniqorn Games */}
            <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-4 md:px-6 py-4">
                <h3 className="text-base md:text-lg font-semibold text-sky-200">Recent Uniqorn Games</h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Latest unique statistical performances this season
                </p>
              </div>
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {recent.map((game) => (
                    <RecentGameCard
                      key={`${game.firstName}-${game.lastName}-${game.game_date}`}
                      firstName={game.firstName}
                      lastName={game.lastName}
                      game_date={game.game_date}
                      points={game.points}
                      assists={game.assists}
                      rebounds={game.rebounds}
                      blocks={game.blocks}
                      steals={game.steals}
                      opponentteamName={game.opponentteamName}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}
