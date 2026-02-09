import Link from 'next/link';

import { getCurrentSeasonLeaders, getRecentUniqornGames, getMostRecentUltimateUniqorn, getMostRecentGameDate, safeChartFileName } from '@/lib/data';
import UltimateChartCard from '@/components/UltimateChartCard';
import RecentGameCard from '@/components/RecentGameCard';
import UniqornScore from '@/components/UniqornTooltip';

// Revalidate every 5 minutes to show new games and Ultimate UNIQORNs
export const revalidate = 300;

export default async function Page() {
  const [leaders, recent, mostRecentUltimate, lastGameDate] = await Promise.all([
    getCurrentSeasonLeaders(),
    getRecentUniqornGames(),
    getMostRecentUltimateUniqorn(),
    getMostRecentGameDate(),
  ]);

  return (
    <div className="space-y-8">
      {/* MINIMALIST HERO */}
      <div className="relative text-center space-y-12 py-24 md:py-32 overflow-hidden">
        {/* Subtle animated accent */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
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
                  className="text-blue-300"
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
                    className="text-blue-300"
                  />
                );
              })}
              {/* Example data polygon - Asymmetric shape */}
              <polygon
                points="200,80 280,140 260,280 140,280 120,140"
                fill="url(#radarGradient)"
                fillOpacity="0.4"
                stroke="currentColor"
                strokeWidth="2"
                className="text-pink-200"
              />
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(251, 207, 232)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="rgb(147, 197, 253)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </g>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter">
            <span className="text-white">UNIQORN</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light tracking-wide">
            A statistical framework for measuring how unusual NBA performances are. 
            The UNIQORN Index ranks players by how often their stat combinations occur—identifying 
            the distinctive profiles that stand out from typical basketball patterns.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap justify-center gap-4 pt-4">
          <Link 
            href="/search" 
            className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium tracking-wide transition-colors"
          >
            Search
          </Link>
          <Link 
            href="/career" 
            className="px-8 py-3 bg-white hover:bg-zinc-200 text-black font-medium tracking-wide transition-colors"
          >
            Leaders
          </Link>
          <Link 
            href="/about" 
            className="px-8 py-3 border border-white/20 hover:border-white/40 text-white font-medium tracking-wide transition-colors"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Quick Explainer */}
      <div className="max-w-4xl mx-auto">
        <div className="border-l-4 border-pink-500 bg-zinc-900/50 p-6 md:p-8">
          <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
            <span className="font-bold text-white">How it works:</span> We bucket every NBA game by points, rebounds, assists, blocks, and steals—then measure how unique that exact combination is within its season. Higher scores = more unique performances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          {/* Main Content - League Leaders */}
          <section className="lg:col-span-2 space-y-6">
            {/* Data Freshness Warning */}
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm p-3 md:p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs md:text-sm text-amber-200">
                  <span className="font-semibold">Calculated including all games up to {lastGameDate}</span>
                  <span className="text-amber-300/80"> • Updates may be delayed 1-2 days as we rely on external data sources.</span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-zinc-900/50 overflow-hidden">
              <div className="border-b border-white/10 px-4 md:px-6 py-5">
                <h2 className="text-2xl md:text-3xl font-bold text-white">League Leaders</h2>
                <p className="text-xs md:text-sm text-zinc-300 mt-1">
                  Players with the most unique statistical profiles this season
                </p>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-xs md:text-sm">
                    <thead className="border-b border-zinc-700">
                      <tr className="text-left text-zinc-200">
                        <th className="px-2 md:px-4 py-4 font-medium">Rank</th>
                        <th className="px-2 md:px-4 py-4 font-medium">Player</th>
                        <th className="px-2 md:px-4 py-4 font-medium hidden sm:table-cell">Season</th>
                        <th className="px-2 md:px-4 py-4 font-medium text-right hidden md:table-cell">Games</th>
                        <th className="px-2 md:px-4 py-4 font-medium text-right">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {leaders.map((row, i) => (
                        <tr
                          key={`${row.personId}-${row.season}`}
                          className="hover:bg-pink-200/5 transition-colors"
                        >
                          <td className="px-2 md:px-4 py-4">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-300/20 text-blue-200 text-xs font-medium">
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-2 md:px-4 py-4">
                            <Link 
                              href={`/player/${encodeURIComponent(row.firstName + ' ' + row.lastName)}`}
                              className="font-medium text-zinc-50 hover:text-blue-300 transition-colors"
                            >
                              {row.firstName} {row.lastName}
                            </Link>
                            <div className="text-xs text-zinc-400 sm:hidden">{row.season}</div>
                          </td>
                          <td className="px-2 md:px-4 py-4 text-zinc-300 hidden sm:table-cell">{row.season}</td>
                          <td className="px-2 md:px-4 py-4 text-right text-zinc-300 hidden md:table-cell">{row.games}</td>
                          <td className="px-2 md:px-4 py-4">
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
              <div className="border border-pink-500/30 bg-zinc-900/50 overflow-hidden">
                <div className="border-b border-pink-500/30 px-4 md:px-6 py-5">
                  <h3 className="text-xl md:text-2xl font-bold text-pink-400">Ultimate UNIQORN</h3>
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
            <div className="border border-white/10 bg-zinc-900/50 overflow-hidden">
              <div className="border-b border-white/10 px-4 md:px-6 py-5">
                <h3 className="text-xl md:text-2xl font-bold text-white">Recent Games</h3>
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
