'use client';

import { useState, useEffect } from 'react';

interface RecentGame {
  player: string;
  date: string;
  stats: string;
  team: string;
  opponent: string;
  season: string;
  bucketKey: string;
  occurrences: number;
  uniqornScore: number;
}

interface ApiResponse {
  success: boolean;
  data: RecentGame[];
  count: number;
  lastUpdated: string;
}

export default function Scoreboard() {
  const [games, setGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [view, setView] = useState<'ranked' | 'games'>('ranked');
  const [selectedGame, setSelectedGame] = useState<{
    team1: string;
    team2: string;
    players: RecentGame[];
  } | null>(null);

  useEffect(() => {
    fetchRecentGames();
  }, []);

  const fetchRecentGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recent-games');
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setGames(data.data);
        setLastUpdated(data.lastUpdated);
      } else {
        setError('Failed to load recent games');
      }
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const groupGamesByMatchup = (games: RecentGame[]) => {
    const grouped: { [date: string]: { [matchup: string]: RecentGame[] } } = {};
    
    games.forEach(game => {
        const date = game.date;
        // Create a consistent matchup key (alphabetical order)
        const matchup = [game.team, game.opponent].sort().join(' vs ');
        
        if (!grouped[date]) {
            grouped[date] = {};
        }
        if (!grouped[date][matchup]) {
            grouped[date][matchup] = [];
        }
        grouped[date][matchup].push(game);
    });
    
    return Object.entries(grouped).map(([date, matchups]) => ({
      date,
      games: Object.entries(matchups).map(([matchup, players]) => {
        // Extract team names from matchup
        const [team1, team2] = matchup.split(' vs ');
        return { team1, team2, players };
      })
    })).sort((a, b) => b.date.localeCompare(a.date));
  };

  const getUniqornColor = (score: number) => {
    if (score >= 0.9) return 'text-purple-200';
    if (score >= 0.7) return 'text-sky-200';
    if (score >= 0.5) return 'text-emerald-200';
    if (score >= 0.3) return 'text-amber-200';
    return 'text-zinc-300';
  };

  const getOccurrenceColor = (occurrences: number) => {
    if (occurrences === 1) return 'bg-purple-400/20 text-purple-200 border border-purple-400/30';
    if (occurrences === 2) return 'bg-sky-400/20 text-sky-200 border border-sky-400/30';
    if (occurrences <= 5) return 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30';
    if (occurrences <= 10) return 'bg-amber-400/20 text-amber-200 border border-amber-400/30';
    return 'bg-zinc-400/10 text-zinc-200 border border-zinc-400/20';
  };

  const hasPerfectDisplayedScore = (score: number) => {
    return Math.round(score * 1000) / 1000 === 1;
  };

  const showPerfectRepeatNote = (score: number, occurrences: number) => {
    return occurrences > 1 && hasPerfectDisplayedScore(score);
  };

  const formatDate = (dateStr: string) => {
    const parts = String(dateStr).split('-').map((p) => Number(p));
    const date = parts.length === 3 && parts.every((n) => Number.isFinite(n))
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm p-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
              <p className="text-zinc-300">Loading recent games...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-red-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-400/20 to-orange-400/10 px-6 py-4">
            <h1 className="text-3xl font-bold text-zinc-50">Scoreboard</h1>
          </div>
          <div className="p-6">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchRecentGames}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-200 hover:bg-sky-400/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const gameGroups = groupGamesByMatchup(games);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
          <h1 className="text-3xl font-bold text-sky-200">Daily Scoreboard</h1>
          <p className="text-sm text-zinc-300 mt-1">
            {view === 'ranked'
              ? 'Most recent games ranked by Uniqorn score'
              : 'Traditional scoreboard view by game'
            }
          </p>
          {lastUpdated && (
            <p className="text-zinc-400 text-xs mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Refresh Button Only */}
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={fetchRecentGames}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-200 hover:bg-sky-400/20 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

        {/* Ranked View */}
        {view === 'ranked' && (
          <div className="space-y-4">
            {games.length === 0 ? (
              <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm p-12 text-center">
                <p className="text-zinc-300">No recent games found</p>
              </div>
            ) : (
              games.map((game, index) => (
                <div 
                  key={`${game.player}-${game.date}-${index}`}
                  className="rounded-2xl border border-zinc-700/50 bg-zinc-900/60 backdrop-blur-sm p-6 hover:border-sky-400/40 hover:bg-sky-400/5 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Game Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-400/20 text-sky-200 text-xs font-semibold">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-zinc-50">{game.player}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOccurrenceColor(game.occurrences)}`}>
                          {game.occurrences} {game.occurrences === 1 ? 'time' : 'times'}
                        </span>
                        <span className="text-zinc-300 text-sm">
                          {game.season}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        {/* Stats */}
                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/20 p-3">
                          <div className="text-xs text-zinc-400">Stats</div>
                          <div className="font-mono text-zinc-100 mt-1">{game.stats}</div>
                        </div>
                        
                        {/* Game */}
                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/20 p-3">
                          <div className="text-xs text-zinc-400">Matchup</div>
                          <div className="text-zinc-100 mt-1">{game.team} vs {game.opponent}</div>
                        </div>
                        
                        {/* Date */}
                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/20 p-3">
                          <div className="text-xs text-zinc-400">Date</div>
                          <div className="text-zinc-100 mt-1">{formatDate(game.date)}</div>
                        </div>

                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/20 p-3">
                          <div className="text-xs text-zinc-400">Bucket</div>
                          <div className="text-zinc-200 mt-1">{game.bucketKey}</div>
                        </div>
                      </div>
                    </div>

                    {/* Uniqorn Score */}
                    <div className="shrink-0">
                      <div className="rounded-2xl border border-sky-400/20 bg-zinc-950/20 p-4 text-right min-w-[180px]">
                        <div className="text-xs text-zinc-400 tracking-wide">Uniqorn Score</div>
                        <div className={`text-3xl font-bold mt-1 ${getUniqornColor(game.uniqornScore)}`}>
                          {game.uniqornScore.toFixed(3)}
                        </div>
                        {game.occurrences === 1 && (
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                            UNIQORN!
                          </div>
                        )}
                        {showPerfectRepeatNote(game.uniqornScore, game.occurrences) && (
                          <div className="text-xs text-zinc-300 mt-2 leading-tight">Only player with this bucket shape (repeated)</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Games View */}
        {view === 'games' && (
          <div className="space-y-8">
            {/* View Toggle - At top of Games view */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-xl border border-sky-400/20 bg-zinc-950/20 p-1">
                <button
                  onClick={() => setView('ranked')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    view === 'ranked'
                      ? 'bg-sky-400/20 text-sky-200'
                      : 'text-zinc-300 hover:text-zinc-50'
                  }`}
                >
                  Ranked
                </button>
                <button
                  onClick={() => setView('games')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    view === 'games'
                      ? 'bg-sky-400/20 text-sky-200'
                      : 'text-zinc-300 hover:text-zinc-50'
                  }`}
                >
                  Games
                </button>
              </div>
            </div>

            {gameGroups.length === 0 ? (
              <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm p-12 text-center">
                <p className="text-zinc-300">No recent games found</p>
              </div>
            ) : (
              gameGroups.map((gameGroup) => (
                <div key={gameGroup.date} className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
                    <h2 className="text-2xl font-bold text-center text-sky-200">{formatDate(gameGroup.date)}</h2>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-6">
                      {gameGroup.games.map((game, gameIndex) => {
                        const isSelected = Boolean(selectedGame && selectedGame.team1 === game.team1 && selectedGame.team2 === game.team2);

                        return (
                          <div key={gameIndex} className="rounded-2xl border border-zinc-700/50 bg-zinc-950/20 p-5">
                            {/* Game Header - Clickable to toggle */}
                            <div
                              className="group text-center mb-5 cursor-pointer rounded-xl border border-zinc-700/50 bg-zinc-950/10 hover:border-sky-400/30 hover:bg-sky-400/5 p-4 transition-all"
                              onClick={() => {
                                // If this game is already selected, close it. Otherwise, open it.
                                if (selectedGame && selectedGame.team1 === game.team1 && selectedGame.team2 === game.team2) {
                                  setSelectedGame(null);
                                } else {
                                  setSelectedGame(game);
                                }
                              }}
                            >
                              <div className="flex items-center justify-center gap-3">
                                <h3 className="text-xl font-bold text-zinc-50 group-hover:text-sky-200 transition-colors">
                                  {game.team1} vs {game.team2}
                                </h3>
                                <svg
                                  className={`h-5 w-5 text-sky-300 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <p className="text-sm text-zinc-400 mt-1">
                                {isSelected ? 'Click to close' : 'Click for team Uniqorn scores'}
                              </p>
                            </div>

                            {/* Team Uniqorn Scores Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="text-center p-4 rounded-2xl border border-zinc-700/50 bg-zinc-950/10">
                                <h4 className="font-semibold text-zinc-50">{game.team1}</h4>
                                <div className="text-xs text-zinc-400 mt-1">Team Uniqorn Score</div>
                                <div className="text-2xl font-bold text-sky-200 mt-1">
                                  {(() => {
                                    const team1Players = game.players.filter(p => p.team === game.team1);
                                    const team1Avg = team1Players.length > 0
                                      ? team1Players.reduce((sum, p) => sum + p.uniqornScore, 0) / team1Players.length
                                      : 0;
                                    return team1Avg.toFixed(3);
                                  })()}
                                </div>
                              </div>
                              <div className="text-center p-4 rounded-2xl border border-zinc-700/50 bg-zinc-950/10">
                                <h4 className="font-semibold text-zinc-50">{game.team2}</h4>
                                <div className="text-xs text-zinc-400 mt-1">Team Uniqorn Score</div>
                                <div className="text-2xl font-bold text-sky-200 mt-1">
                                  {(() => {
                                    const team2Players = game.players.filter(p => p.team === game.team2);
                                    const team2Avg = team2Players.length > 0
                                      ? team2Players.reduce((sum, p) => sum + p.uniqornScore, 0) / team2Players.length
                                      : 0;
                                    return team2Avg.toFixed(3);
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Selected Game Details */}
                            {selectedGame && selectedGame.team1 === game.team1 && selectedGame.team2 === game.team2 && (
                              <div className="mt-4 rounded-2xl border border-zinc-700/50 bg-zinc-950/10 p-5">
                                <h4 className="text-lg font-semibold text-zinc-50 mb-4">Game Details</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Team 1 Players */}
                                  <div>
                                    <h5 className="text-sm font-semibold text-zinc-300 mb-3">{selectedGame.team1}</h5>
                                    <div className="space-y-2">
                                      {selectedGame.players
                                        .filter(p => p.team === selectedGame.team1)
                                        .sort((a, b) => b.uniqornScore - a.uniqornScore)
                                        .map((player, playerIndex) => (
                                          <div key={playerIndex} className="rounded-xl border border-zinc-700/50 bg-zinc-950/20 p-3 hover:bg-sky-400/5 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                              <div className="flex-1">
                                                <div className="font-medium text-zinc-50 text-sm">{player.player}</div>
                                                <div className="text-xs text-zinc-400 font-mono mt-1">{player.stats}</div>
                                              </div>
                                              <div className="text-right">
                                                <div className={`text-sm font-bold ${getUniqornColor(player.uniqornScore)}`}>
                                                  {player.uniqornScore.toFixed(3)}
                                                </div>
                                                {player.occurrences === 1 && (
                                                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                                                    UNIQORN!
                                                  </div>
                                                )}
                                                {showPerfectRepeatNote(player.uniqornScore, player.occurrences) && (
                                                  <div className="text-[10px] text-zinc-300 leading-tight mt-1">Only player with this bucket shape (repeated)</div>
                                                )}
                                                <div className="mt-2">
                                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getOccurrenceColor(player.occurrences)}`}>
                                                    {player.occurrences}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>

                                  {/* Team 2 Players */}
                                  <div>
                                    <h5 className="text-sm font-semibold text-zinc-300 mb-3">{selectedGame.team2}</h5>
                                    <div className="space-y-2">
                                      {selectedGame.players
                                        .filter(p => p.team === selectedGame.team2)
                                        .sort((a, b) => b.uniqornScore - a.uniqornScore)
                                        .map((player, playerIndex) => (
                                          <div key={playerIndex} className="rounded-xl border border-zinc-700/50 bg-zinc-950/20 p-3 hover:bg-sky-400/5 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                              <div className="flex-1">
                                                <div className="font-medium text-zinc-50 text-sm">{player.player}</div>
                                                <div className="text-xs text-zinc-400 font-mono mt-1">{player.stats}</div>
                                              </div>
                                              <div className="text-right">
                                                <div className={`text-sm font-bold ${getUniqornColor(player.uniqornScore)}`}>
                                                  {player.uniqornScore.toFixed(3)}
                                                </div>
                                                {player.occurrences === 1 && (
                                                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                                                    UNIQORN!
                                                  </div>
                                                )}
                                                {showPerfectRepeatNote(player.uniqornScore, player.occurrences) && (
                                                  <div className="text-[10px] text-zinc-300 leading-tight mt-1">Only player with this bucket shape (repeated)</div>
                                                )}
                                                <div className="mt-2">
                                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getOccurrenceColor(player.occurrences)}`}>
                                                    {player.occurrences}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
    </div>
  );
}
