import { NextRequest, NextResponse } from 'next/server';

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
}

function generateRadarChartHTML(data: ChartData): string {
  const { firstName, lastName, game_date, points, assists, rebounds, blocks, steals } = data;
  
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
        .chart-container {
            background: #18181b;
            border-radius: 16px;
            border: 1px solid rgba(56, 189, 248, 0.2);
            padding: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .title {
            color: #e2e8f0;
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 600;
        }
        .subtitle {
            color: #94a3b8;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <div class="title">${firstName} ${lastName}</div>
        <div class="subtitle">${game_date}</div>
        <div id="radarChart" style="width: 500px; height: 500px;"></div>
    </div>

    <script>
        const stats = {
            'Points': ${points},
            'Assists': ${assists},
            'Rebounds': ${rebounds},
            'Blocks': ${blocks},
            'Steals': ${steals}
        };

        const maxValues = {
            'Points': 70,
            'Assists': 25,
            'Rebounds': 30,
            'Blocks': 15,
            'Steals': 10
        };

        const normalizedStats = Object.keys(stats).map(key => 
            (stats[key] / maxValues[key]) * 100
        );

        const trace1 = {
            type: 'scatterpolar',
            r: normalizedStats,
            theta: Object.keys(stats),
            fill: 'toself',
            name: 'Player Stats',
            line: {
                color: '${data.isUltimate ? 'rgb(168, 85, 247)' : 'rgb(56, 189, 248)'}',
                width: 3
            },
            fillcolor: '${data.isUltimate ? 'rgba(168, 85, 247, 0.3)' : 'rgba(56, 189, 248, 0.3)'}'
        };

        const layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 100],
                    showgrid: true,
                    gridcolor: 'rgba(156, 163, 175, 0.2)',
                    linecolor: 'rgba(156, 163, 175, 0.3)',
                    tickcolor: 'rgba(156, 163, 175, 0.5)',
                    tickfont: {
                        color: 'rgba(156, 163, 175, 0.8)'
                    }
                },
                angularaxis: {
                    showgrid: false,
                    tickfont: {
                        color: '#e2e8f0',
                        size: 12
                    },
                    linecolor: 'rgba(156, 163, 175, 0.3)'
                },
                bgcolor: 'rgba(24, 24, 27, 0.5)'
            },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: {
                color: '#e2e8f0'
            },
            margin: {
                l: 50,
                r: 50,
                t: 50,
                b: 50
            },
            showlegend: false
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('radarChart', [trace1], layout, config);
    </script>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const game_date = searchParams.get('game_date') || '';
  const points = parseInt(searchParams.get('points') || '0');
  const assists = parseInt(searchParams.get('assists') || '0');
  const rebounds = parseInt(searchParams.get('rebounds') || '0');
  const blocks = parseInt(searchParams.get('blocks') || '0');
  const steals = parseInt(searchParams.get('steals') || '0');
  const isUltimate = searchParams.get('isUltimate') === 'true';

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
    isUltimate
  });

  return new Response(chartHTML, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
