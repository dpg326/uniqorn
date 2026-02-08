import { notFound } from 'next/navigation';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import UniqornScore from '@/components/UniqornTooltip';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Revalidate every 5 minutes to show new Ultimate UNIQORNs
export const revalidate = 300;

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
    const nameParts = name.split(' ');
    if (nameParts.length < 2) {
      return null;
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    // Read Uniqorn Master data directly
    const masterPath = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
    const masterBuffer = await readFile(masterPath);
    const XLSX = await import('xlsx');
    const masterWorkbook = XLSX.read(masterBuffer, { type: 'buffer' });
    const masterSheet = masterWorkbook.Sheets['All_Seasons'];
    const masterRows = XLSX.utils.sheet_to_json(masterSheet) as any[];
    
    // Filter for this player
    const playerSeasons = masterRows.filter(row => 
      row.firstName?.toLowerCase() === firstName.toLowerCase() && 
      row.lastName?.toLowerCase() === lastName.toLowerCase()
    );
    
    if (playerSeasons.length === 0) {
      return null;
    }
    
    // Calculate rankings for each season
    const seasonRankings: { [season: string]: Map<string, number> } = {};
    masterRows.forEach(row => {
      const season = row.season;
      if (!seasonRankings[season]) {
        seasonRankings[season] = new Map();
      }
      const playerKey = `${row.firstName} ${row.lastName}`;
      const score = parseFloat(row.avg_weighted_uniqueness) || 0;
      seasonRankings[season].set(playerKey, score);
    });
    
    const seasonRanks: { [season: string]: { [player: string]: number } } = {};
    Object.keys(seasonRankings).forEach(season => {
      const sorted = Array.from(seasonRankings[season].entries())
        .sort((a, b) => b[1] - a[1]);
      seasonRanks[season] = {};
      sorted.forEach((entry, index) => {
        seasonRanks[season][entry[0]] = index + 1;
      });
    });
    
    // Build season data with rankings
    const seasonData: PlayerSeasonData[] = playerSeasons.map(row => ({
      season: row.season,
      games: parseInt(row.games) || 0,
      avg_weighted_uniqueness: parseFloat(row.avg_weighted_uniqueness) || 0,
      rank: seasonRanks[row.season]?.[`${row.firstName} ${row.lastName}`]
    })).sort((a, b) => {
      const aYear = parseInt(a.season.split('-')[0]);
      const bYear = parseInt(b.season.split('-')[0]);
      return bYear - aYear;
    });
    
    const totalScore = seasonData.reduce((sum, s) => sum + s.avg_weighted_uniqueness, 0);
    const careerAverage = seasonData.length > 0 ? totalScore / seasonData.length : 0;
    const totalGames = seasonData.reduce((sum, s) => sum + s.games, 0);
    
    // Read Ultimate Uniqorns data
    const ultimatePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
    const ultimateBuffer = await readFile(ultimatePath);
    const ultimateWorkbook = XLSX.read(ultimateBuffer, { type: 'buffer' });
    const ultimateSheet = ultimateWorkbook.Sheets[ultimateWorkbook.SheetNames[0]];
    const ultimateRows = XLSX.utils.sheet_to_json(ultimateSheet) as any[];
    
    const ultimateUniqorns: UltimateUniqorn[] = ultimateRows
      .filter(row => 
        row.firstName?.toLowerCase() === firstName.toLowerCase() && 
        row.lastName?.toLowerCase() === lastName.toLowerCase()
      )
      .map(row => {
        let formattedDate = '';
        const gameDate = row.game_date;
        if (typeof gameDate === 'string') {
          formattedDate = gameDate.includes('T') ? gameDate.split('T')[0] : gameDate;
        } else if (typeof gameDate === 'number') {
          const date = new Date((gameDate - 25569) * 86400 * 1000);
          formattedDate = date.toISOString().split('T')[0];
        } else if (gameDate instanceof Date) {
          formattedDate = gameDate.toISOString().split('T')[0];
        }
        
        return {
          season: row.season,
          game_date: formattedDate,
          points: parseInt(row.points) || 0,
          assists: parseInt(row.assists) || 0,
          rebounds: parseInt(row.rebounds) || 0,
          blocks: parseInt(row.blocks) || 0,
          steals: parseInt(row.steals) || 0,
          opponentteamName: row.opponentteamName || ''
        };
      })
      .sort((a, b) => b.game_date.localeCompare(a.game_date));
    
    return {
      firstName,
      lastName,
      careerAverage,
      totalSeasons: seasonData.length,
      totalGames,
      seasonData,
      ultimateUniqorns
    };
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
