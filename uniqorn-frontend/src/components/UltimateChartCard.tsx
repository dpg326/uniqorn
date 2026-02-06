'use client';

interface UltimateChartCardProps {
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

export default function UltimateChartCard({
  firstName,
  lastName,
  game_date,
  points,
  assists,
  rebounds,
  blocks,
  steals,
  opponentteamName
}: UltimateChartCardProps) {
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
      isUltimate: 'true',
      ...(opponentteamName && { opponentteamName })
    });
    window.open(`/api/generate-chart?${params.toString()}`, '_blank', 'width=550,height=550');
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-xl font-bold text-zinc-50">
            {firstName} {lastName}
          </div>
          <div className="text-sm text-zinc-400">
            {game_date}
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-200/20 text-pink-200">
            {points} pts
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-200/20 text-pink-200">
            {assists} ast
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-200/20 text-pink-200">
            {rebounds} reb
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-200/20 text-pink-200">
            {blocks} blk
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-200/20 text-pink-200">
            {steals} stl
          </span>
        </div>
        
        <div className="text-center">
          <span className="inline-flex items-center text-xs text-pink-200 group-hover:text-pink-100 transition-colors">
            View Radar Chart →
          </span>
        </div>
      </div>
    </div>
  );
}
