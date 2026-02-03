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
};

export default function GameCard({ game, isUltimate = false }: { game: Game; isUltimate?: boolean }) {
  // Construct the correct chart filename
  const chartFileName = `${game.firstName}_${game.lastName}_${game.game_date}.png`;
  
  const statline = `${game.points} PTS / ${game.assists} AST / ${game.rebounds} REB / ${game.blocks} BLK / ${game.steals} STL`;
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group/item relative rounded-lg border border-sky-500/20 bg-zinc-900/40 p-2 transition hover:border-sky-500/40">
      <div className="relative w-full rounded overflow-hidden" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          {!imageError ? (
            <ChartImage file={chartFileName} isUltimate={isUltimate} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
              Chart not found
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 opacity-0 transition-opacity group-hover/item:opacity-100 pointer-events-none">
          <p className="text-xs text-zinc-200 text-center px-1">{statline}</p>
        </div>
      </div>
      <p className="mt-1 text-xs text-zinc-400 text-center">
        {game.game_date}
      </p>
      <p className="mt-1 text-xs text-sky-300 text-center font-medium">
        {game.firstName} {game.lastName}
      </p>
    </div>
  );
}
