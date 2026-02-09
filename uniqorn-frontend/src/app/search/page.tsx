'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BucketSearchResult {
  bucket: [number, number, number, number, number];
  description: string;
  count: number;
  games: Array<{
    player: string;
    date: string;
    stats: string;
    team: string;
    opponent: string;
  }>;
}

const BUCKET_RANGES = {
  points: ["0-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31-40", "41-50", "51+"],
  assists: ["0-2", "3-5", "6-8", "9-12", "13-20", "21+"],
  rebounds: ["0-2", "3-5", "6-10", "11-15", "16-20", "21+"],
  blocks: ["0-1", "2-3", "4-5", "6-7", "8+"],
  steals: ["0-1", "2-3", "4-5", "6-7", "8+"]
};

export default function BucketSearch() {
  const [pointsBin, setPointsBin] = useState(3);
  const [assistsBin, setAssistsBin] = useState(1);
  const [reboundsBin, setReboundsBin] = useState(1);
  const [blocksBin, setBlocksBin] = useState(0);
  const [stealsBin, setStealsBin] = useState(0);
  const [result, setResult] = useState<BucketSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const bucketDescription = `PTS ${BUCKET_RANGES.points[pointsBin]} | REB ${BUCKET_RANGES.rebounds[reboundsBin]} | AST ${BUCKET_RANGES.assists[assistsBin]} | BLK ${BUCKET_RANGES.blocks[blocksBin]} | STL ${BUCKET_RANGES.steals[stealsBin]}`;

  useEffect(() => {
    searchBucket();
  }, [pointsBin, assistsBin, reboundsBin, blocksBin, stealsBin]);

  const searchBucket = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bucket-search?points_bin=${pointsBin}&rebounds_bin=${reboundsBin}&assists_bin=${assistsBin}&blocks_bin=${blocksBin}&steals_bin=${stealsBin}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatSlider = ({ 
    label, 
    value, 
    onChange, 
    ranges 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    ranges: string[] 
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <span className="text-xs text-blue-300 bg-blue-300/20 px-2 py-1 rounded">
          {ranges[value]}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max={ranges.length - 1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-200"
        style={{
          background: `linear-gradient(to right, #93c5fd 0%, #93c5fd ${(value / (ranges.length - 1)) * 100}%, #374151 ${(value / (ranges.length - 1)) * 100}%, #374151 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{ranges[0]}</span>
        <span>{ranges[ranges.length - 1]}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #93c5fd;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #60a5fa;
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #93c5fd;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          background: #60a5fa;
          transform: scale(1.1);
        }
      `}</style>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 mb-4">Bucket Search</h1>
        <p className="text-sm md:text-base text-zinc-400 px-4">
          Explore statistical combinations and see how unique they are in the current season
        </p>
      </div>

      {/* Search Controls */}
      <div className="rounded-2xl border border-blue-300/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-blue-300/10 px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-semibold text-blue-200">Adjust Stat Ranges</h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1">Move the sliders to select your bucket</p>
        </div>
        
        <div className="p-4 md:p-6 space-y-6">
          <StatSlider 
            label="Points" 
            value={pointsBin} 
            onChange={setPointsBin} 
            ranges={BUCKET_RANGES.points}
          />
          <StatSlider 
            label="Rebounds" 
            value={reboundsBin} 
            onChange={setReboundsBin} 
            ranges={BUCKET_RANGES.rebounds}
          />
          <StatSlider 
            label="Assists" 
            value={assistsBin} 
            onChange={setAssistsBin} 
            ranges={BUCKET_RANGES.assists}
          />
          <StatSlider 
            label="Steals" 
            value={stealsBin} 
            onChange={setStealsBin} 
            ranges={BUCKET_RANGES.steals}
          />
          <StatSlider 
            label="Blocks" 
            value={blocksBin} 
            onChange={setBlocksBin} 
            ranges={BUCKET_RANGES.blocks}
          />
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-blue-300/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden shadow-lg shadow-blue-300/5">
        <div className="bg-blue-300/10 px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-semibold text-blue-200">Results</h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1 break-words">{bucketDescription}</p>
        </div>
        
        <div className="p-4 md:p-6">
          {/* Unconventional Loading Animation - Morphing Hexagons */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-blue-300/20 rounded-lg animate-ping" />
                <div className="absolute inset-0 bg-pink-300/20 rounded-lg animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="absolute inset-0 bg-blue-300/30 rounded-lg animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          )}
          
          {/* Empty State - Geometric Pattern */}
          {!loading && result && result.count === 0 && (
            <div className="text-center py-12">
              <div className="inline-block mb-6">
                <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-20">
                  <polygon points="60,10 100,40 100,80 60,110 20,80 20,40" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-300" />
                  <polygon points="60,30 80,45 80,75 60,90 40,75 40,45" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-300" />
                  <circle cx="60" cy="60" r="8" fill="currentColor" className="text-blue-300/50" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-200 mb-2">
                No Occurrences Found
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                This exact stat combination hasn't occurred in the current season. Try adjusting the ranges above to explore similar performances.
              </p>
            </div>
          )}
          
          {!loading && result && result.count > 0 && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-zinc-300">
                  {result.count >= 10 ? (
                    <><span className="font-semibold text-pink-300">&gt;10</span> occurrences in current season</>
                  ) : (
                    <><span className="font-semibold text-pink-300">{result.count}</span> occurrence{result.count !== 1 ? 's' : ''} in current season</>
                  )}
                </p>
              </div>
              {result.count < 10 && result.count > 0 && result.games.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-zinc-200 mb-4">Game Details</h3>
                    <div className="space-y-3">
                    {result.games.map((game, index) => (
                      <div key={index} className="p-4 rounded-lg border border-zinc-700/50 bg-zinc-800/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-zinc-50">{game.player}</div>
                            <div className="text-sm text-zinc-400">{game.date}</div>
                            <div className="text-sm text-zinc-300 mt-1">{game.team} vs {game.opponent}</div>
                          </div>
                          <div className="text-lg font-semibold text-blue-300">
                            {game.stats}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
