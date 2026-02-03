import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { year: string } }
) {
  try {
    const year = params.year;
    console.log('Fetching Ultimate games for year:', year);
    
    const filePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
    
    const fileBuffer = await readFile(filePath);
    
    // Use XLSX to parse the Excel file
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    console.log('Total rows in Excel:', rows.length);

    // Filter by year and convert dates
    const filteredGames = rows.filter((row) => {
      const gameDate = row.game_date;
      let gameYear: string;
      let formattedDate: string;
      
      if (typeof gameDate === 'string') {
        gameYear = gameDate.includes('T') ? gameDate.split('T')[0].split('-')[0] : gameDate.split('-')[0];
        formattedDate = gameDate.includes('T') ? gameDate.split('T')[0] : gameDate;
      } else if (typeof gameDate === 'number') {
        // Excel serial date conversion
        const date = new Date((gameDate - 25569) * 86400 * 1000);
        gameYear = date.getFullYear().toString();
        formattedDate = date.toISOString().split('T')[0];
      } else {
        return false;
      }
      
      if (gameYear === year) {
        // Update the row with the formatted date
        row.game_date = formattedDate;
        return true;
      }
      return false;
    });

    console.log(`Found ${filteredGames.length} games for year ${year}`);
    if (filteredGames.length > 0) {
      console.log('Sample game:', filteredGames[0]);
    }

    return Response.json(filteredGames);
  } catch (error) {
    console.error('Error reading Ultimate Uniqorn data:', error);
    return Response.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
