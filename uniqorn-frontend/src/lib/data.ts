import * as XLSX from 'xlsx';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export type LeaderRow = {
  personId: string | number;
  firstName: string;
  lastName: string;
  season: string;
  games: number;
  avg_weighted_uniqueness: number;
};

export type AllTimeRow = {
  personId: string | number;
  firstName: string;
  lastName: string;
  games: number;
  avg_weighted_uniqueness: number;
};

export type UniqornGameRow = {
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
  chartFile: string;
  is_new_ultimate?: boolean;
  is_broken_ultimate?: boolean;
};

async function readWorkbook(absPath: string): Promise<XLSX.WorkBook> {
  const bytes = await readFile(absPath);
  return XLSX.read(bytes, { type: 'buffer' });
}

async function readWorkbookSheet<T>(absPath: string, sheetName?: string): Promise<T[]> {
  const wb = await readWorkbook(absPath);
  const targetSheetName = sheetName ?? wb.SheetNames[0];
  const ws = wb.Sheets[targetSheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<T>(ws, { defval: null });
}

export async function getMostRecentGameDate(): Promise<string> {
  try {
    const recentGamesPath = join(process.cwd(), 'public', 'data', 'Most_Recent_Games_Master.xlsx');
    const rows = await readWorkbookSheet<{ date: string }>(recentGamesPath);
    
    if (rows.length === 0) return 'Unknown';
    
    // Find the most recent date
    const dates = rows
      .map(row => row.date)
      .filter(date => date && typeof date === 'string')
      .sort()
      .reverse();
    
    if (dates.length === 0) return 'Unknown';
    
    // Format as "Month Day, Year"
    const dateObj = new Date(dates[0]);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error reading most recent game date:', error);
    return 'Unknown';
  }
}

export async function getCurrentSeasonLeaders(limit = 25): Promise<LeaderRow[]> {
  const uniqornXlsx = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
  const wb = await readWorkbook(uniqornXlsx);

  const seasonSheets = wb.SheetNames.filter((s: string) => s.includes('-') && s !== 'AllTimeTop20');
  const latestSeason = seasonSheets.sort().at(-1);
  if (!latestSeason) return [];

  const ws = wb.Sheets[latestSeason];
  const rows = XLSX.utils.sheet_to_json<LeaderRow>(ws, { defval: null });

  return rows.slice(0, limit);
}

export async function getAvailableSeasons(): Promise<string[]> {
  const uniqornXlsx = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
  const wb = await readWorkbook(uniqornXlsx);
  return wb.SheetNames.filter((s: string) => s.includes('-') && s !== 'AllTimeTop20').sort();
}

export async function getSeasonLeaders(season: string, limit = 50): Promise<LeaderRow[]> {
  const uniqornXlsx = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
  const wb = await readWorkbook(uniqornXlsx);
  const ws = wb.Sheets[season];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json<LeaderRow>(ws, { defval: null });
  return rows.slice(0, limit);
}

export async function getAllTimeLeaders(limit = 50): Promise<AllTimeRow[]> {
  const uniqornXlsx = join(process.cwd(), 'public', 'data', 'Uniqorn_Master.xlsx');
  
  // Always recalculate to ensure games column is populated correctly
  const wb = await readWorkbook(uniqornXlsx);
  const seasonSheets = wb.SheetNames.filter((s: string) => s.includes('-'));

  const byPlayer = new Map<string, { personId: string | number; firstName: string; lastName: string; sum: number; count: number; games?: number }>();
  for (const sheetName of seasonSheets) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<LeaderRow>(ws, { defval: null });
    for (const row of rows) {
      const key = String(row.personId);
      const prev = byPlayer.get(key) ?? {
        personId: row.personId,
        firstName: row.firstName,
        lastName: row.lastName,
        sum: 0,
        count: 0,
        games: 0,
      };
      prev.sum += Number(row.avg_weighted_uniqueness ?? 0);
      prev.count += 1;
      prev.games = (prev.games ?? 0) + Number(row.games ?? 0);
      byPlayer.set(key, prev);
    }
  }

  const computed: AllTimeRow[] = Array.from(byPlayer.values())
    .map((p) => ({
      personId: p.personId,
      firstName: p.firstName,
      lastName: p.lastName,
      games: Number(p.games ?? 0),
      avg_weighted_uniqueness: p.count ? p.sum / p.count : 0,
    }))
    .sort((a, b) => b.avg_weighted_uniqueness - a.avg_weighted_uniqueness);

  return computed.slice(0, limit);
}

function normalizeGameDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'string') {
    const s = String(value ?? '');
    return s.includes('T') ? s.split('T')[0] : s;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && typeof parsed.y === 'number' && typeof parsed.m === 'number' && typeof parsed.d === 'number') {
      const y = String(parsed.y).padStart(4, '0');
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const s = String(value ?? '');
  return s.includes('T') ? s.split('T')[0] : s;
}

export function safeChartFileName(firstName: string, lastName: string, rawDate: any): string {
  const date = normalizeGameDate(rawDate);
  const name = `${firstName}_${lastName}_${date}.png`;
  // Only replace characters that are actually problematic for URLs/files
  // Allow spaces, periods, hyphens, and underscores
  return name.replace(/[^a-zA-Z0-9_. -]/g, '_');
}

export async function getRecentUniqornGames(limit = 10): Promise<UniqornGameRow[]> {
  const filePath = join(process.cwd(), 'public', 'data', 'CurrentSeason_UniqornGames_Master.xlsx');
  const fileBuffer = await readFile(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as any[];

  const games: UniqornGameRow[] = rows
    .map((row) => ({
      season: row.season || '',
      game_date: normalizeGameDate(row.game_date),
      firstName: row.firstName,
      lastName: row.lastName,
      playerteamName: row.playerteamName,
      opponentteamName: row.opponentteamName,
      points: Number(row.points),
      assists: Number(row.assists),
      rebounds: Number(row.reboundsTotal || row.rebounds),
      blocks: Number(row.blocks),
      steals: Number(row.steals),
      chartFile: safeChartFileName(row.firstName, row.lastName, row.game_date),
    }))
    .sort((a, b) => b.game_date.localeCompare(a.game_date))
    .slice(0, limit);

  // Load Ultimate Uniqorn changes for highlighting
  const ultimateChanges = await getUltimateChanges();
  const newUltimateKeys = new Set(ultimateChanges.new.map(k => k.key));
  const brokenUltimateKeys = new Set(ultimateChanges.broken.map(k => k.key));

  return games.map(game => ({
    ...game,
    is_new_ultimate: newUltimateKeys.has(ultimateKey(game)),
    is_broken_ultimate: brokenUltimateKeys.has(ultimateKey(game)),
  }));
}

function ultimateKey(game: UniqornGameRow) {
  return `${game.firstName}_${game.lastName}_${game.game_date}_${game.points}_${game.assists}_${game.rebounds}_${game.blocks}_${game.steals}`;
}

type UltimateChange = {
  key: string;
  firstName: string;
  lastName: string;
  game_date: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
};

type UltimateChanges = {
  new: UltimateChange[];
  broken: UltimateChange[];
};

async function getUltimateChanges(): Promise<UltimateChanges> {
  const changesPath = join(process.cwd(), 'public', 'data', 'ultimate_changes_master.json');
  try {
    const fileBuffer = await readFile(changesPath, 'utf-8');
    return JSON.parse(fileBuffer);
  } catch {
    return { new: [], broken: [] };
  }
}

export async function getMostRecentUltimateUniqorn() {
  const filePath = join(process.cwd(), 'public', 'data', 'Ultimate_Uniqorn_Games_Master.xlsx');
  const fileBuffer = await readFile(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as any[];

  const mostRecent = rows
    .map((row) => ({
      season: row.season,
      game_date: normalizeGameDate(row.game_date),
      firstName: row.firstName,
      lastName: row.lastName,
      playerteamName: row.playerteamName,
      opponentteamName: row.opponentteamName,
      points: Number(row.points),
      assists: Number(row.assists),
      rebounds: Number(row.reboundsTotal || row.rebounds),
      blocks: Number(row.blocks),
      steals: Number(row.steals),
    }))
    .sort((a, b) => b.game_date.localeCompare(a.game_date))[0];

  return mostRecent;
}
