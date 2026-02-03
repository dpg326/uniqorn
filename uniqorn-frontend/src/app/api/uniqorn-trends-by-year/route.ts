import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
    console.log('Reading Uniqorn_Master.xlsx for trends data');
    
    const fileBuffer = await readFile(filePath);
    
    // Use XLSX to parse the Excel file
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const trends: { year: number; leader: number; top10Average: number; top50Average: number }[] = [];
    
    // Process each sheet (each sheet represents a season)
    for (const sheetName of workbook.SheetNames) {
      // Skip all-time sheets and non-seasonal data
      if (!sheetName.includes('-') || sheetName.toLowerCase().includes('alltime') || sheetName.toLowerCase().includes('career')) {
        continue;
      }
      
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];
      
      if (rows.length === 0) continue;
      
      console.log(`Processing ${sheetName}: ${rows.length} players`);
      
      // Sort by avg_weighted_uniqueness to find the leader
      const sortedRows = rows.sort((a, b) => b.avg_weighted_uniqueness - a.avg_weighted_uniqueness);
      
      const leader = sortedRows[0]?.avg_weighted_uniqueness || 0;
      const leaderName = sortedRows[0] ? `${sortedRows[0].firstName} ${sortedRows[0].lastName}` : 'N/A';
      
      // Calculate top 10 average
      const top10 = sortedRows.slice(0, 10);
      const top10Average = top10.length > 0 
        ? top10.reduce((sum, row) => sum + row.avg_weighted_uniqueness, 0) / top10.length 
        : 0;
      
      // Calculate top 50 average
      const top50 = sortedRows.slice(0, Math.min(50, sortedRows.length));
      const top50Average = top50.length > 0 
        ? top50.reduce((sum, row) => sum + row.avg_weighted_uniqueness, 0) / top50.length 
        : 0;
      
      // Extract year from season (e.g., "2024-25" -> 2024)
      const year = parseInt(sheetName.split('-')[0]);
      
      console.log(`${sheetName}: Leader ${leaderName} = ${leader}, Top10 Avg = ${top10Average}, Top50 Avg = ${top50Average}`);
      
      trends.push({ year, leader, top10Average, top50Average });
    }
    
    // Sort by year
    trends.sort((a, b) => a.year - b.year);
    
    console.log('Generated trends data:', trends.length, 'years');
    
    return Response.json(trends);
  } catch (error) {
    console.error('Error reading Uniqorn trends data:', error);
    return Response.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
