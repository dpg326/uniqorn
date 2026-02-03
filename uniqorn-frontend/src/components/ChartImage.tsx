'use client';

import { useState } from 'react';

export default function ChartImage({ file, isUltimate = false }: { file: string; isUltimate?: boolean }) {
  const [currentSrc, setCurrentSrc] = useState(
    isUltimate 
      ? `/api/ultimate-charts/${file}`
      : `/api/season-charts/${file}`
  );
  
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0) {
      // Try the fallback chart location
      const fallbackSrc = isUltimate 
        ? `/api/season-charts/${file}`
        : `/api/ultimate-charts/${file}`;
      setCurrentSrc(fallbackSrc);
      setErrorCount(1);
    }
  };

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
