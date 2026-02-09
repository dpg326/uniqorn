import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limit: 20 requests per minute per IP (chart generation is more expensive)
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 20
});

interface ChartData {
  firstName: string;
  lastName: string;
  game_date: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
  isUltimate?: boolean;
  opponentteamName?: string;
}

function generateRadarChartHTML(data: ChartData): string {
  const { firstName, lastName, game_date, points, assists, rebounds, blocks, steals, isUltimate, opponentteamName } = data;
  
  // Use the same bucket definitions as the Python script
  const points_bins = [0, 5, 10, 15, 20, 25, 30, 40, 50, Infinity];
  const assists_bins = [0, 2, 5, 8, 12, 20, Infinity];
  const rebounds_bins = [0, 2, 5, 10, 15, 20, Infinity];
  const blocks_bins = [0, 1, 3, 5, 7, Infinity];
  const steals_bins = [0, 1, 3, 5, 7, Infinity];
  
  // Convert raw stats to bucket indices (matching the exact bucket ranges from Python)
  const getBucketIndex = (value: number, bins: number[]) => {
    // Based on the ranges in get_bucket_description:
    // Points: "0-5"=0, "6-10"=1, "11-15"=2, "16-20"=3, "21-25"=4, "26-30"=5, "31-40"=6, "41-50"=7, "51+"=8
    // Assists: "0-2"=0, "3-5"=1, "6-8"=2, "9-12"=3, "13-20"=4, "21+"=5
    // Rebounds: "0-2"=0, "3-5"=1, "6-10"=2, "11-15"=3, "16-20"=4, "21+"=5
    // Blocks: "0-1"=0, "2-3"=1, "4-5"=2, "6-7"=3, "8+"=4
    // Steals: "0-1"=0, "2-3"=1, "4-5"=2, "6-7"=3, "8+"=4
    
    if (bins.length === 10) { // Points bins
      if (value >= 0 && value <= 5) return 0;
      else if (value >= 6 && value <= 10) return 1;
      else if (value >= 11 && value <= 15) return 2;
      else if (value >= 16 && value <= 20) return 3;
      else if (value >= 21 && value <= 25) return 4;
      else if (value >= 26 && value <= 30) return 5;
      else if (value >= 31 && value <= 40) return 6;
      else if (value >= 41 && value <= 50) return 7;
      else return 8;
    } else if (bins.length === 7) { // Assists, Rebounds bins
      if (value >= 0 && value <= 2) return 0;
      else if (value >= 3 && value <= 5) return 1;
      else if (value >= 6 && value <= 8) return 2;
      else if (value >= 9 && value <= 12) return 3;
      else if (value >= 13 && value <= 20) return 4;
      else return 5;
    } else if (bins.length === 6) { // Blocks, Steals bins
      if (value >= 0 && value <= 1) return 0;
      else if (value >= 2 && value <= 3) return 1;
      else if (value >= 4 && value <= 5) return 2;
      else if (value >= 6 && value <= 7) return 3;
      else return 4;
    }
    return 0;
  };
  
  const points_bin = getBucketIndex(points, points_bins);
  const assists_bin = getBucketIndex(assists, assists_bins);
  const rebounds_bin = getBucketIndex(rebounds, rebounds_bins);
  const blocks_bin = getBucketIndex(blocks, blocks_bins);
  const steals_bin = getBucketIndex(steals, steals_bins);
  
  const values = [points_bin, rebounds_bin, assists_bin, blocks_bin, steals_bin];
  const values_closed = [...values, values[0]];
  const labels = ["PTS", "REB", "AST", "BLK", "STL"];
  const labels_closed = [...labels, labels[0]];
  
  const max_bucket = Math.max(
    points_bins.length - 2,
    assists_bins.length - 2,
    rebounds_bins.length - 2,
    blocks_bins.length - 2,
    steals_bins.length - 2
  );
  
  const accent = isUltimate ? "rgb(168, 85, 247)" : "rgb(56, 189, 248)";
  const fillColor = isUltimate ? "rgba(168, 85, 247, 0.20)" : "rgba(56, 189, 248, 0.20)";
  
  const title = opponentteamName 
    ? `${firstName} ${lastName} vs ${opponentteamName} (${game_date})`
    : `${firstName} ${lastName} (${game_date})`;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Uniqorn Radar Chart - ${firstName} ${lastName}</title>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #09090b;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="radarChart" style="width: 100%; height: 100vh; max-width: 480px; max-height: 480px; margin: 0 auto;"></div>

    <script>
        const trace1 = {
            type: 'scatterpolar',
            r: ${JSON.stringify(values_closed)},
            theta: ${JSON.stringify(labels_closed)},
            fill: 'toself',
            fillcolor: '${fillColor}',
            line: {
                color: '${accent}',
                width: 3
            },
            marker: {
                color: '${accent}',
                size: 6
            }
        };

        const layout = {
            template: 'plotly_dark',
            title: {
                text: '${title}',
                x: 0.5,
                xanchor: 'center',
                font: {
                    size: 14,
                    color: 'rgba(224, 242, 254, 1)'
                }
            },
            margin: {
                l: 40,
                r: 40,
                t: 70,
                b: 40
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            polar: {
                bgcolor: 'rgba(0,0,0,0)',
                radialaxis: {
                    range: [0, ${max_bucket}],
                    showticklabels: true,
                    tickfont: {
                        color: 'rgba(228,228,231,1)'
                    }
                },
                angularaxis: {
                    tickfont: {
                        color: 'rgba(224,242,254,1)'
                    }
                }
            },
            showlegend: false
        };

        const config = {
            responsive: true,
            displayModeBar: false,
            staticPlot: false
        };

        Plotly.newPlot('radarChart', [trace1], layout, config);
    </script>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIp(request);
  const rateLimitResult = limiter.check(ip);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    );
  }
  
  const { searchParams } = request.nextUrl;
  
  // Input validation and sanitization
  const sanitizeName = (name: string) => name
    .replace(/[^a-zA-Z\s\-'.]/g, '') // Only allow letters, spaces, hyphens, apostrophes, dots
    .slice(0, 50)
    .trim();
  
  const sanitizeTeamName = (name: string) => name
    .replace(/[^a-zA-Z\s]/g, '') // Only allow letters and spaces
    .slice(0, 30)
    .trim();
  
  const sanitizeDate = (date: string) => date
    .replace(/[^0-9\-\/]/g, '') // Only allow numbers, hyphens, slashes
    .slice(0, 20);
  
  const firstName = sanitizeName(searchParams.get('firstName') || '');
  const lastName = sanitizeName(searchParams.get('lastName') || '');
  const game_date = sanitizeDate(searchParams.get('game_date') || '');
  const points = Math.max(0, Math.min(200, parseInt(searchParams.get('points') || '0')));
  const assists = Math.max(0, Math.min(50, parseInt(searchParams.get('assists') || '0')));
  const rebounds = Math.max(0, Math.min(50, parseInt(searchParams.get('rebounds') || '0')));
  const blocks = Math.max(0, Math.min(20, parseInt(searchParams.get('blocks') || '0')));
  const steals = Math.max(0, Math.min(20, parseInt(searchParams.get('steals') || '0')));
  const isUltimate = searchParams.get('isUltimate') === 'true';
  const opponentteamName = sanitizeTeamName(searchParams.get('opponentteamName') || '');

  if (!firstName || !lastName || !game_date) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const chartHTML = generateRadarChartHTML({
    firstName,
    lastName,
    game_date,
    points,
    assists,
    rebounds,
    blocks,
    steals,
    isUltimate,
    opponentteamName
  });

  return new Response(chartHTML, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
