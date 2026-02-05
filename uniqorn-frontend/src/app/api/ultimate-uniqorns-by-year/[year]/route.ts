import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { year: string } }
) {
  try {
    const seasonParam = params.year; // This is actually a season like "2024-25"
    console.log('Fetching Ultimate games for season:', seasonParam);
    
    const filePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
    
    const fileBuffer = await readFile(filePath);
    
    // Use XLSX to parse the Excel file
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    console.log('Total rows in Excel:', rows.length);

    // Filter by season and format dates
    const filteredGames = rows.filter((row) => {
      const season = row.season;
      
      if (season === seasonParam) {
        // Format the game_date for display
        const gameDate = row.game_date;
        if (typeof gameDate === 'string') {
          row.game_date = gameDate.includes('T') ? gameDate.split('T')[0] : gameDate;
        } else if (typeof gameDate === 'number') {
          const date = new Date((gameDate - 25569) * 86400 * 1000);
          row.game_date = date.toISOString().split('T')[0];
        } else if (gameDate instanceof Date) {
          row.game_date = gameDate.toISOString().split('T')[0];
        }
        return true;
      }
      return false;
    });

    console.log(`Found ${filteredGames.length} games for season ${seasonParam}`);
    if (filteredGames.length > 0) {
      console.log('Sample game:', filteredGames[0]);
    }

    return Response.json(filteredGames);
  } catch (error) {
    console.error('Error reading Ultimate Uniqorn data:', error);
    return Response.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
