import Link from 'next/link';
import { getUltimateData, type PlayerEntry } from '@/lib/ultimate';
import GameCard from '@/components/GameCard';

// Revalidate every 5 minutes to show new Ultimate UNIQORNs
export const revalidate = 300;

export default async function Page() {
  const data = await getUltimateData();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-200 mb-4">Ultimate UNIQORN Games</h1>
        <p className="text-lg text-zinc-300 max-w-3xl mx-auto">
          Players whose bucketed statlines have only ever occurred once in NBA history (1973–present). 
          These are the rarest statistical performances in basketball history.
        </p>
      </div>

      <div className="space-y-6">
        {data.map((player) => (
          <PlayerCard key={`${player.firstName}-${player.lastName}`} player={player} />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerEntry }) {
  return (
    <div className="rounded-2xl border border-pink-200/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
      <details className="group">
        <summary className="cursor-pointer list-none p-6 hover:bg-pink-200/5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-pink-200">
                {player.firstName} {player.lastName}
              </span>
              <span className="ml-4 text-sm text-pink-200 bg-pink-200/20 px-2 py-1 rounded-full">
                {player.uniqorn_games} UNIQORN game{player.uniqorn_games !== 1 ? "s" : ""}
              </span>
            </div>
            <svg
              className="h-6 w-6 text-pink-200 transition-transform duration-200 group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {player.games.map((game) => (
              <GameCard key={`${game.game_date}-${game.opponentteamName}`} game={game} isUltimate={true} />
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
