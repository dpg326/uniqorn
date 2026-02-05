import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    if (query.length < 2) {
      return Response.json([]);
    }
    
    // Read Uniqorn Master data
    const masterPath = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
    const masterBuffer = await readFile(masterPath);
    const XLSX = await import('xlsx');
    const masterWorkbook = XLSX.read(masterBuffer, { type: 'buffer' });
    const masterSheet = masterWorkbook.Sheets['All_Seasons'];
    const masterRows = XLSX.utils.sheet_to_json(masterSheet) as any[];
    
    // Get unique player names
    const playerNames = new Set<string>();
    masterRows.forEach(row => {
      if (row.firstName && row.lastName) {
        playerNames.add(`${row.firstName} ${row.lastName}`);
      }
    });
    
    // Filter by query and return top 10 matches
    const matches = Array.from(playerNames)
      .filter(name => name.toLowerCase().includes(query))
      .sort((a, b) => {
        // Prioritize names that start with the query
        const aStarts = a.toLowerCase().startsWith(query);
        const bStarts = b.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10);
    
    return Response.json(matches);
  } catch (error) {
    console.error('Error searching players:', error);
    return Response.json([]);
  }
}
