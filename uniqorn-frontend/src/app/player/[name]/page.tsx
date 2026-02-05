import { notFound } from 'next/navigation';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import UniqornScore from '@/components/UniqornTooltip';

interface PlayerSeasonData {
  season: string;
  games: number;
  avg_weighted_uniqueness: number;
  rank?: number;
}

interface UltimateUniqorn {
  season: string;
  game_date: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
  opponentteamName: string;
}

interface PlayerProfileData {
  firstName: string;
  lastName: string;
  careerAverage: number;
  totalSeasons: number;
  totalGames: number;
  seasonData: PlayerSeasonData[];
  ultimateUniqorns: UltimateUniqorn[];
}

async function getPlayerProfile(name: string): Promise<PlayerProfileData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/player/${encodeURIComponent(name)}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

export default async function PlayerProfilePage({ params }: { params: { name: string } }) {
  const playerName = decodeURIComponent(params.name);
  const profile = await getPlayerProfile(playerName);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-sky-100">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-lg text-zinc-400">Player Profile</p>
      </div>

      {/* Career Stats Summary */}
      <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
          <h2 className="text-2xl font-bold text-sky-200">Career Statistics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-zinc-400 mb-2">Career Average</div>
              <div className="text-3xl font-bold text-sky-200">
                {profile.careerAverage.toFixed(4)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-zinc-400 mb-2">Total Seasons</div>
              <div className="text-3xl font-bold text-sky-200">{profile.totalSeasons}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-zinc-400 mb-2">Total Games</div>
              <div className="text-3xl font-bold text-sky-200">{profile.totalGames}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-zinc-400 mb-2">Ultimate Uniqorns</div>
              <div className="text-3xl font-bold text-purple-200">{profile.ultimateUniqorns.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Season by Season */}
      <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
          <h2 className="text-2xl font-bold text-sky-200">Season by Season</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/40">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">Season</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-300">Games</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-300">Uniqorn Score</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-300">League Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {profile.seasonData.map((season) => (
                <tr key={season.season} className="hover:bg-sky-400/5 transition-colors">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{season.season}</td>
                  <td className="px-4 py-3 text-center text-zinc-300">{season.games}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <UniqornScore score={season.avg_weighted_uniqueness} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      season.rank && season.rank <= 10 
                        ? 'bg-sky-400/20 text-sky-200 border border-sky-400/30'
                        : 'bg-zinc-700/40 text-zinc-300'
                    }`}>
                      #{season.rank || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ultimate Uniqorns */}
      {profile.ultimateUniqorns.length > 0 && (
        <div className="rounded-2xl border border-purple-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 px-6 py-4">
            <h2 className="text-2xl font-bold text-purple-200">Ultimate Uniqorns</h2>
            <p className="text-sm text-zinc-300 mt-1">
              Once-in-history statistical performances
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {profile.ultimateUniqorns.map((game) => (
                <GameCard
                  key={game.game_date}
                  game={{
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    game_date: game.game_date,
                    points: game.points,
                    assists: game.assists,
                    rebounds: game.rebounds,
                    blocks: game.blocks,
                    steals: game.steals,
                    opponentteamName: game.opponentteamName
                  }}
                  isUltimate={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="text-center pb-8">
        <Link 
          href="/" 
          className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-400/20 text-sky-200 hover:bg-sky-400/30 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
