'use client';

import { useState } from 'react';

interface UniqornScoreProps {
  score: number;
}

function getOccurrenceFromScore(score: number): string {
  // Inverse of exponential formula: score = e^(-0.10 * effective_count)
  // Therefore: effective_count = -ln(score) / 0.10
  const ALPHA = 0.10;
  
  if (score >= 0.99) {
    return "1-2";
  }
  
  const effectiveCount = -Math.log(score) / ALPHA;
  
  if (effectiveCount <= 2) {
    return "1-2";
  } else if (effectiveCount <= 4) {
    return "3-5";
  } else if (effectiveCount <= 7) {
    return "5-8";
  } else if (effectiveCount <= 12) {
    return "8-15";
  } else if (effectiveCount <= 20) {
    return "15-25";
  } else if (effectiveCount <= 35) {
    return "25-40";
  } else {
    return "40+";
  }
}

export default function UniqornScore({ score }: UniqornScoreProps) {
  const [isVisible, setIsVisible] = useState(false);
  const occurrenceRange = getOccurrenceFromScore(score);

  return (
    <div className="relative text-right">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help inline-block"
      >
        <span className="font-semibold text-sky-300">
          {score.toFixed(4)}
        </span>
      </div>
      
      {isVisible && (
        <div className="absolute z-50 right-0 top-full mt-1 w-56 pointer-events-none">
          <div className="bg-zinc-900 border border-sky-400/30 rounded-lg p-3 shadow-xl">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Their average bucketed statline occurs <strong className="text-sky-300">{occurrenceRange} times</strong> per season league-wide
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
