import { notFound } from 'next/navigation';
import Link from 'next/link';
import GameCard from '@/components/GameCard';

interface UltimateGame {
  season: string;
  game_date: string;
  firstName: string;
  lastName: string;
  playerteamName: string;
  opponentteamName: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
}

async function getUltimateGamesByYear(year: string): Promise<UltimateGame[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/ultimate-uniqorns-by-year/${year}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    const games = await response.json();
    return games;
  } catch (error) {
    console.error('Error fetching Ultimate games by year:', error);
    return [];
  }
}

export default async function UltimateByYearPage({ params }: { params: { year: string } }) {
  const season = params.year; // This is actually a season like "2024-25"
  
  // Validate season format (YYYY-YY)
  if (!/^\d{4}-\d{2}$/.test(season)) {
    notFound();
  }

  const games = await getUltimateGamesByYear(season);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-200 mb-4">
          Ultimate Uniqorns - {season} Season
        </h1>
        <p className="text-lg text-zinc-300 max-w-3xl mx-auto">
          {games.length} unique statistical performance{games.length !== 1 ? 's' : ''} from the {season} season
        </p>
      </div>

      <div className="text-center">
        <Link 
          href="/visualizations" 
          className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-400/20 text-sky-200 hover:bg-sky-400/30 transition-colors"
        >
          ← Back to Visualizations
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">No Ultimate Uniqorn games found for the {season} season</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {games.map((game) => (
            <GameCard 
              key={`${game.game_date}-${game.opponentteamName}`} 
              game={game} 
              isUltimate={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
