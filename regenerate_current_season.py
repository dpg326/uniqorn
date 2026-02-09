"""
Regenerate current season data from NBA API.
Fetches all games from season start through yesterday and merges with master database.
Use this when you need to catch up on missed games (e.g., after CSV is outdated).
"""
import json
import time
import unicodedata
from datetime import datetime, timedelta
from data_utils import create_buckets
import nba_api_data

CURRENT_SEASON = "2025-26"
SEASON_START_DATE = "2025-10-21"  # Update this each season

def regenerate_current_season():
    """
    Fetch all current season games from NBA API and merge with master database.
    """
    print("🔄 Regenerating Current Season Data")
    print("=" * 60)
    start_time = time.time()
    
    # Load master database
    print("📂 Loading master bucket database...")
    try:
        with open("master_bucket_database.json", "r") as f:
            master_data = json.load(f)
        print(f"   Loaded {len(master_data):,} existing buckets")
    except FileNotFoundError:
        print("❌ Master database not found! Run master_bucket_precompute.py first")
        return
    
    # Calculate date range: season start to yesterday
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    print(f"📅 Fetching games from {SEASON_START_DATE} to {yesterday}")
    print(f"   Season: {CURRENT_SEASON}")
    
    # Fetch from NBA API
    print("📡 Fetching from NBA API...")
    new_df = nba_api_data.fetch_games_since_date(start_date=SEASON_START_DATE, season=CURRENT_SEASON)
    
    if new_df.empty:
        print("❌ No data returned from NBA API")
        return
    
    print(f"   Retrieved {len(new_df):,} player stat lines")
    
    # Filter to current season only
    new_df = new_df[new_df['gameDateTimeEst'] <= yesterday + ' 23:59:59']
    print(f"   Filtered to {len(new_df):,} games through {yesterday}")
    
    # Create buckets
    print("🔢 Creating buckets...")
    new_df = create_buckets(new_df)
    
    # Assign season
    new_df['season'] = CURRENT_SEASON
    
    print(f"📊 Processing {len(new_df):,} games...")
    
    # Track statistics
    games_added = 0
    games_updated = 0
    buckets_updated = set()
    
    # Determine rebounds column name
    rebounds_col = 'reboundsTotal' if 'reboundsTotal' in new_df.columns else 'rebounds'
    
    # Process each game
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
        
        # Check if bucket exists
        if bucket_str not in master_data:
            # New bucket
            master_data[bucket_str] = {
                "count": 1,
                "games": [game_record]
            }
            games_added += 1
            buckets_updated.add(bucket_str)
        else:
            # Existing bucket - check if game already exists
            existing_games = master_data[bucket_str]['games']
            game_exists = any(
                g['player'] == game_record['player'] and 
                g['date'] == game_record['date'] and
                g['stats'] == game_record['stats']
                for g in existing_games
            )
            
            if not game_exists:
                # Add new game to existing bucket
                master_data[bucket_str]['games'].insert(0, game_record)
                master_data[bucket_str]['count'] += 1
                games_added += 1
                buckets_updated.add(bucket_str)
            else:
                games_updated += 1
    
    # Save updated master database
    print("💾 Saving updated master database...")
    with open("master_bucket_database.json", "w") as f:
        json.dump(master_data, f, indent=2)
    
    # Update summary
    print("📈 Updating summary statistics...")
    total_games = sum(bucket['count'] for bucket in master_data.values())
    uniqorn_count = sum(1 for bucket in master_data.values() if bucket['count'] == 1)
    
    # Get date range
    all_dates = []
    for bucket_info in master_data.values():
        for game in bucket_info['games']:
            all_dates.append(game['date'])
    
    min_date = min(all_dates) if all_dates else None
    max_date = max(all_dates) if all_dates else None
    
    summary = {
        "total_games": total_games,
        "total_buckets": len(master_data),
        "uniqorn_count": uniqorn_count,
        "uniqorn_percentage": (uniqorn_count / total_games * 100) if total_games > 0 else 0,
        "date_range": f"{min_date} to {max_date}",
        "last_updated": datetime.now().isoformat()
    }
    
    with open("master_bucket_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    duration = time.time() - start_time
    
    print("=" * 60)
    print("✅ Current Season Regeneration Complete!")
    print(f"   Duration: {duration:.2f} seconds")
    print(f"   Games added: {games_added:,}")
    print(f"   Games already existed: {games_updated:,}")
    print(f"   Buckets updated: {len(buckets_updated):,}")
    print(f"   Total games in database: {total_games:,}")
    print(f"   Total buckets: {len(master_data):,}")
    print(f"   Uniqorn games: {uniqorn_count:,}")
    print(f"   Date range: {min_date} to {max_date}")
    print("=" * 60)

if __name__ == "__main__":
    regenerate_current_season()
