import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
    return bucketData;
  }

  try {
    // Use the correct path in public/data directory
    const dataPath = join(process.cwd(), 'public', 'data', 'master_bucket_database.json');
    const fileContent = await readFile(dataPath, 'utf-8');
    bucketData = JSON.parse(fileContent);
    lastLoadTime = now;
    return bucketData;
  } catch (error) {
    console.error('Failed to load bucket data:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const points_bin = parseInt(searchParams.get('points_bin') || '0');
    const assists_bin = parseInt(searchParams.get('assists_bin') || '0');
    const rebounds_bin = parseInt(searchParams.get('rebounds_bin') || '0');
    const blocks_bin = parseInt(searchParams.get('blocks_bin') || '0');
    const steals_bin = parseInt(searchParams.get('steals_bin') || '0');

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

    const bucketStr = `(${bucket_key.join(', ')})`;
    const bucketInfo = data[bucketStr];

    const result: BucketSearchResult = {
      bucket: bucket_key,
      description: description,
      count: bucketInfo ? bucketInfo.count : 0,
      games: bucketInfo ? bucketInfo.games : []
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
