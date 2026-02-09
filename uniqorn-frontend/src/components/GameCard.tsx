'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ChartImage from './ChartImage';

type Game = {
  firstName: string;
  lastName: string;
  game_date: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
  opponentteamName?: string;
};

export default function GameCard({ game, isUltimate = false }: { game: Game; isUltimate?: boolean }) {
  const chartFileName = `${game.firstName}_${game.lastName}_${game.game_date}.png`;
  const statline = `${game.points} PTS / ${game.rebounds} REB / ${game.assists} AST / ${game.blocks} BLK / ${game.steals} STL`;
  const [showChart, setShowChart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleGenerateChart = () => {
    const params = new URLSearchParams({
      firstName: game.firstName,
      lastName: game.lastName,
      game_date: game.game_date,
      points: game.points.toString(),
      assists: game.assists.toString(),
      rebounds: game.rebounds.toString(),
      blocks: game.blocks.toString(),
      steals: game.steals.toString(),
      isUltimate: isUltimate.toString(),
      ...(game.opponentteamName && { opponentteamName: game.opponentteamName })
    });
    window.open(`/api/generate-chart?${params.toString()}`, '_blank', 'width=550,height=550');
  };

  return (
    <div className="group/item relative rounded-lg border border-sky-500/20 bg-zinc-900/40 p-2 transition hover:border-sky-500/40">
      <div className="relative w-full rounded overflow-hidden" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/60 p-2">
          <button
            onClick={handleGenerateChart}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 rounded-lg text-sky-200 text-xs md:text-sm font-medium transition-colors"
          >
            View Chart
          </button>
          <p className="mt-2 md:mt-3 text-[10px] md:text-xs text-zinc-300 text-center px-1">{statline}</p>
        </div>
      </div>
      <p className="mt-1 text-[10px] md:text-xs text-zinc-400 text-center">
        {game.game_date}
      </p>
      <p className="mt-1 text-xs md:text-sm text-sky-300 text-center font-medium">
        {game.firstName} {game.lastName}
      </p>
    </div>
  );
}
