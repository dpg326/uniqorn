'use client';

interface RecentGameCardProps {
  firstName: string;
  lastName: string;
  game_date: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
  opponentteamName?: string;
}

export default function RecentGameCard({
  firstName,
  lastName,
  game_date,
  points,
  assists,
  rebounds,
  blocks,
  steals,
  opponentteamName
}: RecentGameCardProps) {
  const handleClick = () => {
    const params = new URLSearchParams({
      firstName,
      lastName,
      game_date,
      points: points.toString(),
      assists: assists.toString(),
      rebounds: rebounds.toString(),
      blocks: blocks.toString(),
      steals: steals.toString(),
      isUltimate: 'false',
      ...(opponentteamName && { opponentteamName })
    });
    window.open(`/api/generate-chart?${params.toString()}`, '_blank', 'width=550,height=550');
  };

  return (
    <div className="group">
      <div className="block p-4 rounded-xl border border-zinc-700/50 hover:border-sky-400/50 hover:bg-sky-400/10 transition-all duration-200 cursor-pointer"
           onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium text-zinc-50 group-hover:text-sky-200 transition-colors">
              {firstName} {lastName}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {game_date}
            </div>
          </div>
          <div className="flex items-center text-xs text-sky-200 opacity-0 group-hover:opacity-100 transition-opacity">
            Chart →
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
            {points} pts
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
            {rebounds} reb
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
            {assists} ast
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
            {blocks} blk
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200">
            {steals} stl
          </span>
        </div>
      </div>
    </div>
  );
}
