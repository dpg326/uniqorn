'use client';

import { useState } from 'react';

export default function ChartImage({ file, isUltimate = false, gameData }: { 
  file: string; 
  isUltimate?: boolean;
  gameData?: {
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
}) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, use dynamic generation; in development, use file-based loading
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (isProduction && gameData) {
      // Generate dynamic chart URL with game data
      const params = new URLSearchParams({
        firstName: gameData.firstName,
        lastName: gameData.lastName,
        game_date: gameData.game_date,
        points: gameData.points.toString(),
        assists: gameData.assists.toString(),
        rebounds: gameData.rebounds.toString(),
        blocks: gameData.blocks.toString(),
        steals: gameData.steals.toString(),
        isUltimate: isUltimate.toString(),
        ...(gameData.opponentteamName && { opponentteamName: gameData.opponentteamName })
      });
      return `/api/generate-chart?${params.toString()}`;
    } else {
      // Use file-based loading for development
      return isUltimate 
        ? `/api/ultimate-charts/${file}`
        : `/api/season-charts/${file}`;
    }
  });
  
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (!isProduction && errorCount === 0) {
      // Try the fallback chart location (only in development)
      const fallbackSrc = isUltimate 
        ? `/api/season-charts/${file}`
        : `/api/ultimate-charts/${file}`;
      setCurrentSrc(fallbackSrc);
      setErrorCount(1);
    }
  };

  // For production with dynamic charts, render as iframe
  if (isProduction && gameData) {
    return (
      <iframe
        src={currentSrc}
        title={`${gameData.firstName} ${gameData.lastName} Radar Chart`}
        style={{ 
          width: '100%', 
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
        onError={handleError}
      />
    );
  }

  // For development, use img tag
  return (
    <img
      src={currentSrc}
      alt={file}
      style={{ 
        width: '100%', 
        height: 'auto', 
        maxHeight: 'none',
        display: 'block'
      }}
      onError={handleError}
    />
  );
}
