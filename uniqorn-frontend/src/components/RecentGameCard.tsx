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
    <div 
      className="group relative rounded-lg border border-pink-200/20 bg-zinc-900/40 p-4 transition-colors hover:border-pink-200/30 hover:bg-zinc-900/60 cursor-pointer" 
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
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-200/20 text-pink-200 border border-pink-200/30 transition-colors">
            {points} pts
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-200/20 text-pink-200 border border-pink-200/30 transition-colors">
            {rebounds} reb
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-200/20 text-pink-200 border border-pink-200/30 transition-colors">
            {assists} ast
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-200/20 text-pink-200 border border-pink-200/30 transition-colors">
            {steals} stl
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-200/20 text-pink-200 border border-pink-200/30 transition-colors">
            {blocks} blk
          </span>
        </div>
    </div>
  );
}
