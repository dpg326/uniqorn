import pandas as pd
import numpy as np
import json
import time
import unicodedata
from datetime import datetime, timedelta
from data_utils import load_and_clean_data, create_buckets

def incremental_update():
    """
    Ultra-fast daily update that only processes new games
    and merges them with the master bucket database.
    """
    print("Starting Incremental Bucket Update")
    print("=" * 60)
    start_time = time.time()
    
    # Load master database
    print(" Loading master bucket database...")
    try:
        with open("master_bucket_database.json", "r") as f:
            master_data = json.load(f)
        print(f"   Loaded {len(master_data):,} existing buckets")
    except FileNotFoundError:
        print("❌ Master database not found! Run master_bucket_precompute.py first")
        return
    
    # Get latest date from master data
    latest_date = None
    for bucket_info in master_data.values():
        if bucket_info['games']:
            game_date = bucket_info['games'][0]['date']  # Most recent game
            if latest_date is None or game_date > latest_date:
                latest_date = game_date
    
    if latest_date:
        # Look for games 3 days before latest date to catch any missed updates
        search_date = (datetime.strptime(latest_date, '%Y-%m-%d') - timedelta(days=3)).strftime('%Y-%m-%d')
        print(f"   Latest game in master: {latest_date}")
        print(f"   Searching for games since: {search_date}")
    else:
        search_date = "1973-10-01"
        print(f"   No existing data found, loading all games since: {search_date}")
    
    # Load only new data
    print("Loading new game data...")
    new_df = load_and_clean_data("PlayerStatistics.csv", min_date=search_date)
    print(f"   Found {len(new_df):,} rows to process")
    
    if len(new_df) == 0:
        print("No new games found. Database is up to date.")
        return
    
    # Create buckets for new data
    print("Creating buckets for new data...")
    new_df = create_buckets(new_df)
    
    # Add season information
    print("Adding season information...")
    REGULAR_SEASONS = {
        "2023-24": ("2023-10-24", "2024-04-14"),
        "2024-25": ("2024-10-22", "2025-04-13"),
        "2025-26": ("2025-10-21", "2026-04-12"),
    }
    
    def assign_season(date: pd.Timestamp) -> str | None:
        for season, (start, end) in REGULAR_SEASONS.items():
            if pd.Timestamp(start) <= date <= pd.Timestamp(end):
                return season
        return None
    
    new_df["season"] = new_df["gameDateTimeEst"].apply(assign_season)
    new_df = new_df.dropna(subset=["season"])
    
    # Process new games and merge with master
    print("Processing new games and merging with master...")
    new_games_count = 0
    updated_buckets = 0
    
    # Determine rebounds column name (NBA API uses reboundsTotal, Kaggle might use either)
    rebounds_col = 'reboundsTotal' if 'reboundsTotal' in new_df.columns else 'rebounds'
    
    for _, new_game in new_df.iterrows():
        bucket_key = new_game['bucket_key']
        bucket_str = f"({', '.join(map(str, bucket_key))})"
        
        # Create game record with normalized names
        fn_normalized = unicodedata.normalize('NFD', str(new_game['firstName'])).encode('ascii', 'ignore').decode('utf-8')
        ln_normalized = unicodedata.normalize('NFD', str(new_game['lastName'])).encode('ascii', 'ignore').decode('utf-8')
        game_record = {
            "player": f"{fn_normalized} {ln_normalized}",
            "date": new_game['gameDateTimeEst'].strftime('%Y-%m-%d'),
            "stats": f"{int(new_game['points'])}/{int(new_game[rebounds_col])}/{int(new_game['assists'])}/{int(new_game['steals'])}/{int(new_game['blocks'])}",
            "team": new_game['playerteamName'],
            "opponent": new_game['opponentteamName'],
            "season": new_game['season'],
            "personId": int(new_game['personId'])
        }
        
        # Check if this game already exists in master data
        if bucket_str in master_data:
            existing_games = master_data[bucket_str]['games']
            game_exists = any(
                g['player'] == game_record['player'] and 
                g['date'] == game_record['date'] 
                for g in existing_games
            )
            
            if not game_exists:
                # Add new game to existing bucket
                master_data[bucket_str]['games'].insert(0, game_record)  # Insert at front (most recent)
                master_data[bucket_str]['count'] += 1
                
                # Update seasons and players (handle missing keys for older database formats)
                if 'seasons' not in master_data[bucket_str]:
                    master_data[bucket_str]['seasons'] = []
                if 'players' not in master_data[bucket_str]:
                    master_data[bucket_str]['players'] = []
                    
                if game_record['season'] not in master_data[bucket_str]['seasons']:
                    master_data[bucket_str]['seasons'].append(game_record['season'])
                if game_record['player'] not in master_data[bucket_str]['players']:
                    master_data[bucket_str]['players'].append(game_record['player'])
                
                new_games_count += 1
                updated_buckets += 1
        else:
            # Create new bucket
            master_data[bucket_str] = {
                "count": 1,
                "games": [game_record],
                "seasons": [game_record['season']],
                "players": [game_record['player']]
            }
            new_games_count += 1
            updated_buckets += 1
    
    print(f"   Added {new_games_count} new games")
    print(f"   Updated {updated_buckets} buckets")
    
    # Save updated master data
    print("Saving updated master database...")
    with open("master_bucket_database.json", "w") as f:
        json.dump(master_data, f)
    
    # Update summary statistics
    print("Updating summary statistics...")
    all_seasons = set()
    for bucket in master_data.values():
        if 'seasons' in bucket:
            all_seasons.update(bucket['seasons'])
    
    summary = {
        "total_games": sum(bucket['count'] for bucket in master_data.values()),
        "total_buckets": len(master_data),
        "total_seasons": len(all_seasons),
        "date_range": {
            "start": min(bucket['games'][-1]['date'] for bucket in master_data.values() if bucket['games']),
            "end": max(bucket['games'][0]['date'] for bucket in master_data.values() if bucket['games'])
        },
        "uniqorn_count": len([b for b in master_data.values() if b['count'] == 1]),
        "two_occurrence_count": len([b for b in master_data.values() if b['count'] == 2]),
        "last_updated": datetime.now().isoformat(),
        "bucket_distribution": {
            "1": len([b for b in master_data.values() if b['count'] == 1]),
            "2": len([b for b in master_data.values() if b['count'] == 2]),
            "3-5": len([b for b in master_data.values() if 3 <= b['count'] <= 5]),
            "6-10": len([b for b in master_data.values() if 6 <= b['count'] <= 10]),
            "11+": len([b for b in master_data.values() if b['count'] >= 11])
        }
    }
    
    with open("master_bucket_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    # Performance summary
    end_time = time.time()
    duration = end_time - start_time
    
    print("=" * 60)
    print("Incremental Update Complete!")
    print(f"   Duration: {duration:.2f} seconds")
    print(f"   New games added: {new_games_count}")
    print(f"   Total games: {summary['total_games']:,}")
    print(f"   Total buckets: {summary['total_buckets']:,}")
    print(f"   Uniqorn games: {summary['uniqorn_count']:,}")
    print(f"   Database updated: master_bucket_database.json")
    print("=" * 60)

if __name__ == "__main__":
    incremental_update()
