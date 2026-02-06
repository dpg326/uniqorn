import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limit: 60 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 60
});

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

// Cache the bucket data
let bucketData: any = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function loadBucketData() {
  const now = Date.now();
  if (bucketData && (now - lastLoadTime) < CACHE_DURATION) {
    console.log('Using cached bucket data');
    return bucketData;
  }

  try {
    // Use the correct path in public/data directory
    const dataPath = join(process.cwd(), 'public', 'data', 'master_bucket_database.json');
    console.log('Loading bucket data from:', dataPath);
    
    const fileContent = await readFile(dataPath, 'utf-8');
    console.log('File content length:', fileContent.length);
    
    bucketData = JSON.parse(fileContent);
    console.log('Parsed bucket data, keys:', Object.keys(bucketData).length);
    lastLoadTime = now;
    return bucketData;
  } catch (error) {
    console.error('Failed to load bucket data:', error);
    return null;
  }
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
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    );
  }
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Input validation - ensure bin values are within valid ranges
    const validateBin = (value: string | null, max: number): number => {
      const parsed = parseInt(value || '0');
      return Math.max(0, Math.min(max, isNaN(parsed) ? 0 : parsed));
    };
    
    const points_bin = validateBin(searchParams.get('points_bin'), 8); // 0-8 for points
    const assists_bin = validateBin(searchParams.get('assists_bin'), 5); // 0-5 for assists
    const rebounds_bin = validateBin(searchParams.get('rebounds_bin'), 5); // 0-5 for rebounds
    const blocks_bin = validateBin(searchParams.get('blocks_bin'), 4); // 0-4 for blocks
    const steals_bin = validateBin(searchParams.get('steals_bin'), 4); // 0-4 for steals

    const bucket_key: [number, number, number, number, number] = [
      points_bin, assists_bin, rebounds_bin, blocks_bin, steals_bin
    ];

    // Bucket descriptions
    const points_ranges = ["0-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31-40", "41-50", "51+"];
    const assists_ranges = ["0-2", "3-5", "6-8", "9-12", "13-20", "21+"];
    const rebounds_ranges = ["0-2", "3-5", "6-10", "11-15", "16-20", "21+"];
    const blocks_ranges = ["0-1", "2-3", "4-5", "6-7", "8+"];
    const steals_ranges = ["0-1", "2-3", "4-5", "6-7", "8+"];

    const description = `PTS ${points_ranges[points_bin]} | AST ${assists_ranges[assists_bin]} | REB ${rebounds_ranges[rebounds_bin]} | BLK ${blocks_ranges[blocks_bin]} | STL ${steals_ranges[steals_bin]}`;

    // Load bucket data
    const data = await loadBucketData();
    
    if (!data) {
      return NextResponse.json(
        { error: 'Bucket data not available' },
        { status: 500 }
      );
    }

    console.log('Available bucket keys:', Object.keys(data).slice(0, 5)); // Show first 5 keys
    console.log('Total buckets:', Object.keys(data).length);

    const bucketStr = `(${bucket_key.join(', ')})`;
    console.log('Looking for bucket key:', bucketStr); // Debug log
    const bucketInfo = data[bucketStr];

    // Filter games to current season only
    const CURRENT_SEASON = '2025-26';
    const currentSeasonGames = bucketInfo 
      ? bucketInfo.games.filter((g: any) => g.season === CURRENT_SEASON)
      : [];

    const result: BucketSearchResult = {
      bucket: bucket_key,
      description: description,
      count: currentSeasonGames.length,
      games: currentSeasonGames
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Bucket search error:', error);
    return NextResponse.json(
      { error: 'Failed to search bucket' },
      { status: 500 }
    );
  }
}
