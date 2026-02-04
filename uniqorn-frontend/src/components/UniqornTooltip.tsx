'use client';

import { useState } from 'react';

interface UniqornTooltipProps {
  score: number;
  children: React.ReactNode;
}

function getScoreContext(score: number): { label: string; color: string; description: string } {
  if (score >= 0.65) {
    return {
      label: 'Elite',
      color: 'text-purple-400',
      description: 'Top 1% of all seasons - Historically exceptional uniqueness'
    };
  } else if (score >= 0.55) {
    return {
      label: 'Exceptional',
      color: 'text-pink-400',
      description: 'Top 5% of seasons - Outstanding statistical uniqueness'
    };
  } else if (score >= 0.45) {
    return {
      label: 'Very Good',
      color: 'text-sky-400',
      description: 'Top 20% of seasons - Well above average uniqueness'
    };
  } else if (score >= 0.35) {
    return {
      label: 'Above Average',
      color: 'text-sky-300',
      description: 'Top 50% of seasons - Moderately unique profile'
    };
  } else {
    return {
      label: 'Common',
      color: 'text-zinc-400',
      description: 'Below average uniqueness - More typical statistical profile'
    };
  }
}

export default function UniqornTooltip({ score, children }: UniqornTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const context = getScoreContext(score);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none">
          <div className="bg-zinc-900 border border-sky-400/30 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-bold ${context.color}`}>{context.label}</span>
              <span className="text-zinc-400 text-sm">({score.toFixed(4)})</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {context.description}
            </p>
            <div className="mt-2 pt-2 border-t border-zinc-700">
              <p className="text-xs text-zinc-400">
                Higher scores = more unique statistical combinations
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-zinc-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
