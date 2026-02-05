'use client';

import { useEffect, useState } from 'react';

interface YearData {
  year: number;
  count: number;
}

interface TooltipData {
  x: number;
  y: number;
  year: number;
  count: number;
}

export default function UltimateUniqornsChart() {
  const [data, setData] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/ultimate-uniqorns-by-year');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePointClick = (year: number) => {
    window.location.href = `/ultimate-by-year/${year}`;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 256;

    // Find closest data point
    const maxCount = Math.max(...data.map(d => d.count));
    let closestPoint: TooltipData | null = null;
    let minDistance = Infinity;

    data.forEach((item, index) => {
      const pointX = (index / (data.length - 1)) * 800;
      const pointY = maxCount > 0 ? 256 - (item.count / maxCount) * 230 : 256;
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance < minDistance && distance < 40) { // Increased to 40px threshold for easier interaction
        minDistance = distance;
        closestPoint = {
          x: (pointX / 800) * rect.width,
          y: (pointY / 256) * rect.height,
          year: item.year,
          count: item.count
        };
      }
    });

    setTooltip(closestPoint);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading Ultimate Uniqorn data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <div className="bg-zinc-900/60 rounded-2xl border border-sky-400/20 p-6">
        <h3 className="text-lg font-semibold text-sky-200 mb-4">
          Ultimate Uniqorns by Year
        </h3>
        <p className="text-sm text-zinc-400 mb-6">
          Number of games that have occurred only once in NBA history (1973-present)
        </p>
        
        {/* Line chart using SVG */}
        <div className="relative h-64">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-400">
              No data available
            </div>
          ) : (
            <>
              <svg 
                className="w-full h-full" 
                viewBox="0 0 800 256" 
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <line
                    key={percent}
                    x1="0"
                    y1={256 - (percent * 2.56)}
                    x2="800"
                    y2={256 - (percent * 2.56)}
                    stroke="rgba(156, 163, 175, 0.2)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  points={data.map((item, index) => {
                    const maxCount = Math.max(...data.map(d => d.count));
                    const x = (index / (data.length - 1)) * 800;
                    const y = maxCount > 0 ? 256 - (item.count / maxCount) * 230 : 256;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                
                {/* Area under the line */}
                <polygon
                  fill="url(#areaGradient)"
                  points={`0,256 ${data.map((item, index) => {
                    const maxCount = Math.max(...data.map(d => d.count));
                    const x = (index / (data.length - 1)) * 800;
                    const y = maxCount > 0 ? 256 - (item.count / maxCount) * 230 : 256;
                    return `${x},${y}`;
                  }).join(' ')} 800,256`}
                />
                
                {/* Data points with larger hit areas */}
                {data.map((item, index) => {
                  const maxCount = Math.max(...data.map(d => d.count));
                  const x = (index / (data.length - 1)) * 800;
                  const y = maxCount > 0 ? 256 - (item.count / maxCount) * 230 : 256;
                  
                  return (
                    <g key={item.year}>
                      {/* Invisible larger circle for easier clicking */}
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => handlePointClick(item.year)}
                      />
                      {/* Visible data point */}
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="rgb(56, 189, 248)"
                        className="cursor-pointer hover:fill-sky-300 transition-colors pointer-events-none"
                      />
                    </g>
                  );
                })}
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(56, 189, 248)" />
                    <stop offset="100%" stopColor="rgb(147, 197, 253)" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Tooltip */}
              {tooltip && (
                <div 
                  className="absolute bg-zinc-800 text-white px-3 py-2 rounded text-xs z-50 border border-sky-400/30 pointer-events-none"
                  style={{ 
                    left: `${tooltip.x}px`, 
                    top: `${tooltip.y - 40}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="font-semibold">{tooltip.year}</div>
                  <div>{tooltip.count} Ultimate Uniqorn{tooltip.count !== 1 ? 's' : ''}</div>
                  <div className="text-sky-300 text-xs mt-1">Click to view games</div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-sky-200">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-sm text-zinc-400">Total Ultimate Games</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-200">
              {data.length > 0 ? Math.max(...data.map(d => d.count)) : 0}
            </div>
            <div className="text-sm text-zinc-400">Peak Year</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-200">
              {data.length > 0 ? (data.reduce((sum, item) => sum + item.count, 0) / data.length).toFixed(1) : 0}
            </div>
            <div className="text-sm text-zinc-400">Average per Year</div>
          </div>
        </div>
      </div>
    </div>
  );
}
