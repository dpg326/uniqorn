import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as XLSX from 'xlsx';

interface RecentGame {
  player: string;
  date: string;
  stats: string;
  team: string;
  opponent: string;
  season: string;
  bucketKey: string;
  occurrences: number;
  uniqornScore: number;
}

let cachedData: RecentGame[] | null = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function calculateUniqornScore(occurrences: number): number {
  const ALPHA = 0.10;
  return Math.exp(-ALPHA * occurrences);
}

async function loadRecentGames(): Promise<RecentGame[]> {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cachedData && (now - lastLoadTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // Use the correct path in public/data directory
    const exactFilename = 'Most_Recent_Games_Master.xlsx';
    const dataPath = join(process.cwd(), 'public', 'data', exactFilename);
    
    console.log('Reading Excel file:', dataPath);
    
    const fileContent = await readFile(dataPath);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel columns:', Object.keys(data[0] || {}));
    console.log('Sample row:', data[0]);
    
    // Transform to RecentGame format with scores
    const gamesWithScores: RecentGame[] = data.map((row: any) => ({
      player: row['player'] || 'Unknown Player',
      date: String(row['date'] || row['game_date'] || row['gameDate'] || new Date().toISOString().split('T')[0]),
      stats: row['stats'],
      team: row['team'],
      opponent: row['opponent'],
      season: String(row['season'] || '2025-26'),
      bucketKey: row['bucket_desc'] || 'unknown',
      occurrences: row['bucket_count'] || 1,
      uniqornScore: row['uniqueness_score'] || 0
    }));
    
    // Sort by uniqorn score (highest first), then by player name
    gamesWithScores.sort((a, b) => {
      if (b.uniqornScore !== a.uniqornScore) {
        return b.uniqornScore - a.uniqornScore;
      }
      // Handle undefined player names
      const playerA = a.player || '';
      const playerB = b.player || '';
      return playerA.localeCompare(playerB);
    });
    
    // Cache the results
    cachedData = gamesWithScores;
    lastLoadTime = now;
    
    console.log(`Processed ${gamesWithScores.length} recent games`);
    return gamesWithScores;
    
  } catch (error) {
    console.error('Failed to load recent games:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const recentGames = await loadRecentGames();
    
    return NextResponse.json({
      success: true,
      data: recentGames,
      count: recentGames.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load recent games',
        data: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
