'use client';

import { useEffect, useState } from 'react';

interface TrendData {
  year: number;
  leader: number;
  top10Average: number;
  top50Average: number;
}

interface TooltipData {
  x: number;
  y: number;
  year: number;
  leader: number;
  top10Average: number;
  top50Average: number;
  type: 'leader' | 'top10' | 'top50';
}

export default function UniqornTrendsChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/uniqorn-trends-by-year');
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

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 256;

    if (data.length === 0) return;

    // Find closest data point
    const allValues = [
      ...data.map(d => ({ ...d, type: 'leader' as const, value: d.leader })),
      ...data.map(d => ({ ...d, type: 'top10' as const, value: d.top10Average })),
      ...data.map(d => ({ ...d, type: 'top50' as const, value: d.top50Average }))
    ];

    const maxValue = Math.max(...allValues.map(d => d.value));
    let closestPoint: TooltipData | null = null;
    let minDistance = Infinity;

    data.forEach((item, index) => {
      const pointX = (index / (data.length - 1)) * 800;
      
      // Check leader line
      const leaderY = maxValue > 0 ? 256 - (item.leader / maxValue) * 230 : 256;
      const leaderDistance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - leaderY, 2));
      
      if (leaderDistance < minDistance && leaderDistance < 20) {
        minDistance = leaderDistance;
        closestPoint = {
          x: (pointX / 800) * rect.width,
          y: (leaderY / 256) * rect.height,
          year: item.year,
          leader: item.leader,
          top10Average: item.top10Average,
          top50Average: item.top50Average,
          type: 'leader'
        };
      }
      
      // Check top10 line
      const top10Y = maxValue > 0 ? 256 - (item.top10Average / maxValue) * 230 : 256;
      const top10Distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - top10Y, 2));
      
      if (top10Distance < minDistance && top10Distance < 20) {
        minDistance = top10Distance;
        closestPoint = {
          x: (pointX / 800) * rect.width,
          y: (top10Y / 256) * rect.height,
          year: item.year,
          leader: item.leader,
          top10Average: item.top10Average,
          top50Average: item.top50Average,
          type: 'top10'
        };
      }
      
      // Check top50 line
      const top50Y = maxValue > 0 ? 256 - (item.top50Average / maxValue) * 230 : 256;
      const top50Distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - top50Y, 2));
      
      if (top50Distance < minDistance && top50Distance < 20) {
        minDistance = top50Distance;
        closestPoint = {
          x: (pointX / 800) * rect.width,
          y: (top50Y / 256) * rect.height,
          year: item.year,
          leader: item.leader,
          top10Average: item.top10Average,
          top50Average: item.top50Average,
          type: 'top50'
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
        <div className="text-zinc-400">Loading Uniqorn trends data...</div>
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

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.leader, d.top10Average, d.top50Average)));

  return (
    <div className="w-full h-96">
      <div className="bg-zinc-900/60 rounded-2xl border border-sky-400/20 p-6">
        <h3 className="text-lg font-semibold text-sky-200 mb-4">
          Uniqorn Index Trends Over Time
        </h3>
        <p className="text-sm text-zinc-400 mb-6">
          Purple: Annual leader | Blue: Top 10 average | Gray: Top 50 average. Higher values indicate more unique statistical performances.
        </p>
        
        {/* Line chart using SVG */}
        <div className="relative h-64">
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
            
            {/* Leader line (purple) */}
            <polyline
              fill="none"
              stroke="rgb(168, 85, 247)"
              strokeWidth="3"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 800;
                const y = maxValue > 0 ? 256 - (item.leader / maxValue) * 230 : 256;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Top 10 average line (blue) */}
            <polyline
              fill="none"
              stroke="rgb(56, 189, 248)"
              strokeWidth="2"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 800;
                const y = maxValue > 0 ? 256 - (item.top10Average / maxValue) * 230 : 256;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Top 50 average line (gray) */}
            <polyline
              fill="none"
              stroke="rgb(156, 163, 175)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 800;
                const y = maxValue > 0 ? 256 - (item.top50Average / maxValue) * 230 : 256;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points for leader */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = maxValue > 0 ? 256 - (item.leader / maxValue) * 230 : 256;
              
              return (
                <circle
                  key={`leader-${item.year}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="rgb(168, 85, 247)"
                />
              );
            })}
            
            {/* Data points for top 10 */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = maxValue > 0 ? 256 - (item.top10Average / maxValue) * 230 : 256;
              
              return (
                <circle
                  key={`top10-${item.year}`}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="rgb(56, 189, 248)"
                />
              );
            })}
            
            {/* Data points for top 50 */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 800;
              const y = maxValue > 0 ? 256 - (item.top50Average / maxValue) * 230 : 256;
              
              return (
                <circle
                  key={`top50-${item.year}`}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="rgb(156, 163, 175)"
                />
              );
            })}
          </svg>
          
          {/* Tooltip */}
          {tooltip && (
            <div 
              className="absolute bg-zinc-800 text-white px-2 py-1 rounded text-xs pointer-events-none z-50 border border-sky-400/30"
              style={{ 
                left: `${tooltip.x}px`, 
                top: `${tooltip.y - 40}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-semibold">{tooltip.year}</div>
              {tooltip.type === 'leader' ? (
                <div className="text-purple-300">Leader: {tooltip.leader.toFixed(4)}</div>
              ) : tooltip.type === 'top10' ? (
                <div className="text-sky-300">Top 10 Avg: {tooltip.top10Average.toFixed(4)}</div>
              ) : (
                <div className="text-gray-300">Top 50 Avg: {tooltip.top50Average.toFixed(4)}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-purple-300">
              {data[data.length - 1]?.leader.toFixed(4) || 'N/A'}
            </div>
            <div className="text-sm text-zinc-400">Current Year Leader</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-sky-300">
              {data[data.length - 1]?.top10Average.toFixed(4) || 'N/A'}
            </div>
            <div className="text-sm text-zinc-400">Current Top 10 Average</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-300">
              {data[data.length - 1]?.top50Average.toFixed(4) || 'N/A'}
            </div>
            <div className="text-sm text-zinc-400">Current Top 50 Average</div>
          </div>
        </div>
      </div>
    </div>
  );
}
