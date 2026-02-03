import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), '..', 'Ultimate_Uniqorn_Games_Master.xlsx');
    console.log('Reading file:', filePath);
    
    const fileBuffer = await readFile(filePath);
    
    // Use XLSX to parse the Excel file
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    console.log('Total rows:', rows.length);

    // Group by year and count
    const yearCounts: { [year: string]: number } = {};
    
    rows.forEach((row) => {
      const gameDate = row.game_date;
      let year: string;
      
      if (typeof gameDate === 'string') {
        year = gameDate.includes('T') ? gameDate.split('T')[0].split('-')[0] : gameDate.split('-')[0];
      } else if (typeof gameDate === 'number') {
        // Excel serial date conversion
        const date = new Date((gameDate - 25569) * 86400 * 1000);
        year = date.getFullYear().toString();
      } else {
        console.log('Invalid date format:', gameDate);
        return;
      }
      
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    console.log('Year counts:', yearCounts);

    // Convert to array and sort by year
    const data = Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    console.log('Final data:', data);

    return Response.json(data);
  } catch (error) {
    console.error('Error reading Ultimate Uniqorn data:', error);
    const details = error instanceof Error ? error.message : String(error);
    return Response.json({ error: 'Failed to load data', details }, { status: 500 });
  }
}
