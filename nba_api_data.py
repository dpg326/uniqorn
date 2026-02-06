"""
NBA API Data Fetching Module
Fetches game data from NBA API and formats it to match the existing pipeline format.
This replaces the Kaggle data source while maintaining identical data structure.

OPTIMIZED: Uses leaguegamelog endpoint to fetch ALL players' games in ONE API call.
"""

from nba_api.stats.endpoints import leaguegamelog
import pandas as pd
import time
from datetime import datetime, timedelta

# Rate limiting settings
REQUEST_DELAY = 1.5  # seconds between API calls (increased for NBA API compliance)

# Current season
CURRENT_SEASON = "2025-26"


def fetch_all_games_for_season(season=CURRENT_SEASON):
    """
    Fetch ALL player games for a season in ONE API call.
    This is much faster than fetching individual player game logs.
    
    Args:
        season: Season string (e.g., '2025-26')
    
    Returns:
        DataFrame with all player games for the season
    """
    print(f"  Fetching all games for season {season} (single API call)...")
    try:
        time.sleep(REQUEST_DELAY)
        
        gamelog = leaguegamelog.LeagueGameLog(
            season=season,
            season_type_all_star='Regular Season',
            player_or_team_abbreviation='P'  # P = Player stats
        )
        df = gamelog.get_data_frames()[0]
        
        if df.empty:
            print("    No games found")
            return pd.DataFrame()
        
        print(f"    Retrieved {len(df)} player stat lines")
        return df
        
    except Exception as e:
        print(f"    Error fetching games: {e}")
        return pd.DataFrame()


def format_to_pipeline_structure(df):
    """
    Convert NBA API LeagueGameLog format to match PlayerStatistics.csv structure.
    
    Args:
        df: DataFrame from LeagueGameLog endpoint
    
    Returns:
        DataFrame with columns matching PlayerStatistics.csv format
    """
    if df.empty:
        return df
    
    records = []
    for _, row in df.iterrows():
        # Parse player name
        player_name = row['PLAYER_NAME']
        name_parts = player_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Parse matchup to get team and opponent
        matchup = row['MATCHUP']
        if ' vs. ' in matchup:
            parts = matchup.split(' vs. ')
            team = parts[0]
            opponent = parts[1]
        elif ' @ ' in matchup:
            parts = matchup.split(' @ ')
            team = parts[0]
            opponent = parts[1]
        else:
            team = row.get('TEAM_ABBREVIATION', 'UNK')
            opponent = 'UNK'
        
        # Create record matching PlayerStatistics.csv format
        record = {
            'personId': int(row['PLAYER_ID']),
            'firstName': first_name,
            'lastName': last_name,
            'gameDateTimeEst': pd.to_datetime(row['GAME_DATE']),
            'playerteamName': team,
            'opponentteamName': opponent,
            'points': int(row['PTS']) if pd.notna(row['PTS']) else 0,
            'assists': int(row['AST']) if pd.notna(row['AST']) else 0,
            'reboundsTotal': int(row['REB']) if pd.notna(row['REB']) else 0,
            'blocks': int(row['BLK']) if pd.notna(row['BLK']) else 0,
            'steals': int(row['STL']) if pd.notna(row['STL']) else 0,
        }
        records.append(record)
    
    return pd.DataFrame(records)


def fetch_games_since_date(start_date, end_date=None, season=CURRENT_SEASON):
    """
    Fetch all player games from start_date to end_date.
    OPTIMIZED: Uses single API call to get all games, then filters by date.
    
    Args:
        start_date: datetime or string in YYYY-MM-DD format
        end_date: datetime or string in YYYY-MM-DD format (default: today)
        season: NBA season string (e.g., '2025-26')
    
    Returns:
        DataFrame with columns matching PlayerStatistics.csv format
    """
    if isinstance(start_date, str):
        min_date = pd.to_datetime(start_date)
    else:
        min_date = pd.to_datetime(start_date)
    
    print(f"Fetching NBA API data since {min_date.date()} for season {season}...")
    
    # Fetch all games for the season in one call
    raw_df = fetch_all_games_for_season(season)
    
    if raw_df.empty:
        print("No games found")
        return pd.DataFrame()
    
    # Convert to pipeline format
    df = format_to_pipeline_structure(raw_df)
    
    # Filter by date
    df = df[df['gameDateTimeEst'] >= min_date]
    
    # Remove duplicates (same player, same date)
    df = df.drop_duplicates(subset=['personId', 'gameDateTimeEst'], keep='first')
    
    print(f"Total: {len(df)} player stat lines since {min_date.date()}")
    return df


def fetch_recent_games(days_back=3, season=CURRENT_SEASON):
    """
    Fetch games from the last N days.
    
    Args:
        days_back: Number of days to look back (default: 3)
        season: NBA season string
    
    Returns:
        DataFrame with columns matching PlayerStatistics.csv format
    """
    start_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
    return fetch_games_since_date(start_date, season=season)


if __name__ == '__main__':
    # Test the module
    print("=" * 60)
    print("NBA API Data Module Test (OPTIMIZED)")
    print("=" * 60)
    
    import time
    start = time.time()
    
    # Test fetching recent games (last 3 days)
    df = fetch_recent_games(days_back=3)
    
    elapsed = time.time() - start
    
    if not df.empty:
        print("\nSample data:")
        print(df[['firstName', 'lastName', 'gameDateTimeEst', 'points', 'assists', 'reboundsTotal', 'blocks', 'steals']].head(10))
        print("\nColumns:", df.columns.tolist())
        print(f"\nTotal rows: {len(df)}")
        print(f"Unique players: {df['personId'].nunique()}")
        print(f"Date range: {df['gameDateTimeEst'].min()} to {df['gameDateTimeEst'].max()}")
        print(f"\n⚡ Completed in {elapsed:.2f} seconds")
    else:
        print("No data retrieved")
