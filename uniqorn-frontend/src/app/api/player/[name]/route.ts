import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';

interface PlayerSeasonData {
  season: string;
  games: number;
  avg_weighted_uniqueness: number;
  rank?: number;
}

interface UltimateUniqorn {
  season: string;
  game_date: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
  opponentteamName: string;
}

interface PlayerProfileData {
  firstName: string;
  lastName: string;
  careerAverage: number;
  totalSeasons: number;
  totalGames: number;
  seasonData: PlayerSeasonData[];
  ultimateUniqorns: UltimateUniqorn[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const playerName = decodeURIComponent(params.name);
    console.log('Fetching player profile for:', playerName);
    
    // Split name into first and last
    const nameParts = playerName.split(' ');
    if (nameParts.length < 2) {
      console.log('Invalid name format:', playerName);
      return Response.json({ error: 'Invalid player name format' }, { status: 400 });
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    console.log('Searching for:', firstName, lastName);
    
    // Read Uniqorn Master data
    const masterPath = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
    console.log('Reading from:', masterPath);
    const masterBuffer = await readFile(masterPath);
    console.log('File read successfully, size:', masterBuffer.length);
    const XLSX = await import('xlsx');
    const masterWorkbook = XLSX.read(masterBuffer, { type: 'buffer' });
    const masterSheet = masterWorkbook.Sheets['All_Seasons'];
    const masterRows = XLSX.utils.sheet_to_json(masterSheet) as any[];
    console.log('Total rows in master:', masterRows.length);
    console.log('Sample row:', masterRows[0]);
    console.log('Looking for firstName:', firstName, 'lastName:', lastName);
    
    // Filter for this player (case-insensitive)
    const playerSeasons = masterRows.filter(row => 
      row.firstName?.toLowerCase() === firstName.toLowerCase() && 
      row.lastName?.toLowerCase() === lastName.toLowerCase()
    );
    console.log('Found player seasons:', playerSeasons.length);
    
    if (playerSeasons.length === 0) {
      console.log('Player not found:', firstName, lastName);
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }
    console.log('Processing player data...');
    
    // Calculate rankings for each season
    const seasonRankings: { [season: string]: Map<string, number> } = {};
    
    masterRows.forEach(row => {
      const season = row.season;
      if (!seasonRankings[season]) {
        seasonRankings[season] = new Map();
      }
      const playerKey = `${row.firstName} ${row.lastName}`;
      const score = parseFloat(row.avg_weighted_uniqueness) || 0;
      seasonRankings[season].set(playerKey, score);
    });
    
    // Sort and assign ranks for each season
    const seasonRanks: { [season: string]: { [player: string]: number } } = {};
    Object.keys(seasonRankings).forEach(season => {
      const sorted = Array.from(seasonRankings[season].entries())
        .sort((a, b) => b[1] - a[1]);
      
      seasonRanks[season] = {};
      sorted.forEach((entry, index) => {
        seasonRanks[season][entry[0]] = index + 1;
      });
    });
    
    // Build season data with rankings
    const seasonData: PlayerSeasonData[] = playerSeasons.map(row => ({
      season: row.season,
      games: parseInt(row.games) || 0,
      avg_weighted_uniqueness: parseFloat(row.avg_weighted_uniqueness) || 0,
      rank: seasonRanks[row.season]?.[`${row.firstName} ${row.lastName}`]
    })).sort((a, b) => {
      // Sort by season (most recent first)
      const aYear = parseInt(a.season.split('-')[0]);
      const bYear = parseInt(b.season.split('-')[0]);
      return bYear - aYear;
    });
    
    // Calculate career average
    const totalScore = seasonData.reduce((sum, s) => sum + s.avg_weighted_uniqueness, 0);
    const careerAverage = seasonData.length > 0 ? totalScore / seasonData.length : 0;
    const totalGames = seasonData.reduce((sum, s) => sum + s.games, 0);
    
    // Read Ultimate Uniqorns data
    const ultimatePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
    const ultimateBuffer = await readFile(ultimatePath);
    const ultimateWorkbook = XLSX.read(ultimateBuffer, { type: 'buffer' });
    const ultimateSheet = ultimateWorkbook.Sheets[ultimateWorkbook.SheetNames[0]];
    const ultimateRows = XLSX.utils.sheet_to_json(ultimateSheet) as any[];
    
    // Filter Ultimate Uniqorns for this player
    const ultimateUniqorns: UltimateUniqorn[] = ultimateRows
      .filter(row => 
        row.firstName?.toLowerCase() === firstName.toLowerCase() && 
        row.lastName?.toLowerCase() === lastName.toLowerCase()
      )
      .map(row => {
        // Format date
        let formattedDate = '';
        const gameDate = row.game_date;
        if (typeof gameDate === 'string') {
          formattedDate = gameDate.includes('T') ? gameDate.split('T')[0] : gameDate;
        } else if (typeof gameDate === 'number') {
          const date = new Date((gameDate - 25569) * 86400 * 1000);
          formattedDate = date.toISOString().split('T')[0];
        } else if (gameDate instanceof Date) {
          formattedDate = gameDate.toISOString().split('T')[0];
        }
        
        return {
          season: row.season,
          game_date: formattedDate,
          points: parseInt(row.points) || 0,
          assists: parseInt(row.assists) || 0,
          rebounds: parseInt(row.rebounds) || 0,
          blocks: parseInt(row.blocks) || 0,
          steals: parseInt(row.steals) || 0,
          opponentteamName: row.opponentteamName || ''
        };
      })
      .sort((a, b) => b.game_date.localeCompare(a.game_date));
    
    console.log('Building profile data...');
    const profileData: PlayerProfileData = {
      firstName,
      lastName,
      careerAverage,
      totalSeasons: seasonData.length,
      totalGames,
      seasonData,
      ultimateUniqorns
    };
    
    console.log('Returning profile data for:', firstName, lastName);
    return Response.json(profileData);
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return Response.json({ 
      error: 'Failed to load player profile',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
