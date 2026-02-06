import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limit: 30 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 30
});

export async function GET(request: NextRequest) {
  console.log('Player search API route called');
  
  // Apply rate limiting
  const ip = getClientIp(request);
  const rateLimitResult = limiter.check(ip);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    );
  }
  
  try {
    const { searchParams } = request.nextUrl;
    const rawQuery = searchParams.get('q') || '';
    
    // Input validation and sanitization
    const query = rawQuery
      .toLowerCase()
      .replace(/[^a-z0-9\s\-'.]/gi, '') // Only allow alphanumeric, spaces, hyphens, apostrophes, dots
      .slice(0, 50) // Limit length to prevent abuse
      .trim();
    
    console.log('Search query:', query);
    
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
