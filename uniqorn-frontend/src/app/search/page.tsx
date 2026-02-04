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

  const bucketDescription = `PTS ${BUCKET_RANGES.points[pointsBin]} | AST ${BUCKET_RANGES.assists[assistsBin]} | REB ${BUCKET_RANGES.rebounds[reboundsBin]} | BLK ${BUCKET_RANGES.blocks[blocksBin]} | STL ${BUCKET_RANGES.steals[stealsBin]}`;

  useEffect(() => {
    searchBucket();
  }, [pointsBin, assistsBin, reboundsBin, blocksBin, stealsBin]);

  const searchBucket = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bucket-search?points_bin=${pointsBin}&assists_bin=${assistsBin}&rebounds_bin=${reboundsBin}&blocks_bin=${blocksBin}&steals_bin=${stealsBin}`);
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
        <span className="text-xs text-sky-300 bg-sky-400/20 px-2 py-1 rounded">
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
          background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${(value / (ranges.length - 1)) * 100}%, #374151 ${(value / (ranges.length - 1)) * 100}%, #374151 100%)`
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
          background: #0ea5e9;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #0284c7;
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #0ea5e9;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          background: #0284c7;
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
      <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-semibold text-sky-200">Adjust Stat Ranges</h2>
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
            label="Assists" 
            value={assistsBin} 
            onChange={setAssistsBin} 
            ranges={BUCKET_RANGES.assists}
          />
          <StatSlider 
            label="Rebounds" 
            value={reboundsBin} 
            onChange={setReboundsBin} 
            ranges={BUCKET_RANGES.rebounds}
          />
          <StatSlider 
            label="Blocks" 
            value={blocksBin} 
            onChange={setBlocksBin} 
            ranges={BUCKET_RANGES.blocks}
          />
          <StatSlider 
            label="Steals" 
            value={stealsBin} 
            onChange={setStealsBin} 
            ranges={BUCKET_RANGES.steals}
          />
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-semibold text-sky-200">Results</h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1 break-words">{bucketDescription}</p>
        </div>
        
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="text-center text-zinc-400">Searching...</div>
          ) : result ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-300">
                  {result.count >= 10 ? '>10' : result.count}
                </div>
                <div className="text-sm text-zinc-400">
                  games found in current season
                </div>
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
                          <div className="text-lg font-semibold text-sky-300">
                            {game.stats}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-zinc-400">Adjust the sliders to search</div>
          )}
        </div>
      </div>
    </div>
  );
}
