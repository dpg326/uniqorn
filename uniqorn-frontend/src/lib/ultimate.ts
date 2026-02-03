import * as XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import { join } from 'path';

export type UltimateGame = {
  season: string;
  game_date: string;
  firstName: string;
  lastName: string;
  playerteamName: string;
  opponentteamName: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
};

export type PlayerEntry = {
  firstName: string;
  lastName: string;
  uniqorn_games: number;
  games: UltimateGame[];
};

export async function getUltimateData(): Promise<PlayerEntry[]> {
  const filePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
  const fileBuffer = await readFile(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as any[];

  const games: UltimateGame[] = rows.map((row) => {
    // Handle both string dates and Excel serial dates
    let game_date: string;
    
    if (typeof row.game_date === 'string') {
      // If it's already a string, use it directly
      game_date = row.game_date.includes('T') ? row.game_date.split('T')[0] : row.game_date;
    } else if (typeof row.game_date === 'number') {
      // Excel serial date conversion
      const excelDate = Number(row.game_date);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      game_date = date.toISOString().split('T')[0];
    } else {
      // Fallback for other types
      game_date = String(row.game_date);
    }
    
    return {
      season: row.season,
      game_date,
      firstName: row.firstName,
      lastName: row.lastName,
      playerteamName: row.playerteamName,
      opponentteamName: row.opponentteamName,
      points: Number(row.points),
      assists: Number(row.assists),
      rebounds: Number(row.rebounds),
      blocks: Number(row.blocks),
      steals: Number(row.steals),
    };
  });

  const byPlayer = new Map<string, UltimateGame[]>();
  for (const game of games) {
    const key = `${game.firstName} ${game.lastName}`;
    if (!byPlayer.has(key)) byPlayer.set(key, []);
    byPlayer.get(key)!.push(game);
  }

  const playerEntries: PlayerEntry[] = Array.from(byPlayer.entries())
    .map(([name, games]) => {
      const [firstName, lastName] = name.split(' ');
      return {
        firstName,
        lastName,
        uniqorn_games: games.length,
        games: games.sort((a, b) => b.game_date.localeCompare(a.game_date)),
      };
    })
    .sort((a, b) => b.uniqorn_games - a.uniqorn_games);

  return playerEntries;
}
