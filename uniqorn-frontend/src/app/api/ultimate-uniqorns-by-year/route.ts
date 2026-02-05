import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
    console.log('Reading file:', filePath);
    
    const fileBuffer = await readFile(filePath);
    
    // Use XLSX to parse the Excel file
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    console.log('Total rows:', rows.length);

    // Group by season and count
    const seasonCounts: { [season: string]: number } = {};
    
    rows.forEach((row) => {
      const season = row.season;
      
      if (season && typeof season === 'string') {
        seasonCounts[season] = (seasonCounts[season] || 0) + 1;
      } else {
        console.log('Invalid season:', season);
      }
    });

    console.log('Season counts:', seasonCounts);

    // Convert to array and sort by season (e.g., "2023-24", "2024-25")
    const data = Object.entries(seasonCounts)
      .map(([season, count]) => ({ 
        year: season, // Keep 'year' key for backwards compatibility with chart
        season: season,
        count 
      }))
      .sort((a, b) => {
        // Sort by the starting year of the season
        const aYear = parseInt(a.season.split('-')[0]);
        const bYear = parseInt(b.season.split('-')[0]);
        return aYear - bYear;
      });

    console.log('Final data:', data);

    return Response.json(data);
  } catch (error) {
    console.error('Error reading Ultimate Uniqorn data:', error);
    const details = error instanceof Error ? error.message : String(error);
    return Response.json({ error: 'Failed to load data', details }, { status: 500 });
  }
}
