import pandas as pd
import numpy as np
import json
from datetime import datetime
from master_bucket_utils import MasterBucketDatabase

def generate_seasonal_uniqorn_index():
    """
    Generate the seasonal Uniqorn index spreadsheet showing each player's
    average uniqueness score per season, matching the original Uniqorn.xlsx format.
    """
    print("📊 Generating Seasonal Uniqorn Index")
    print("=" * 60)
    
    # Load master database
    db = MasterBucketDatabase()
    
    # Get all bucket counts for weighted uniqueness calculation
    print("🔢 Calculating bucket counts...")
    bucket_counts = {}
    for bucket_str, bucket_info in db.data.items():
        # Convert string bucket key back to tuple
        bucket_key = tuple(map(int, bucket_str.strip('()').split(', ')))
        bucket_counts[bucket_key] = bucket_info['count']
    
    print(f"   Loaded {len(bucket_counts):,} bucket counts")
    
    # Get per-player bucket counts
    print("👥 Calculating per-player bucket counts...")
    player_bucket_counts = {}
    
    for bucket_str, bucket_info in db.data.items():
        bucket_key = tuple(map(int, bucket_str.strip('()').split(', ')))
        
        for game in bucket_info['games']:
            player_id = game['personId']
            key = (player_id, bucket_key)
            player_bucket_counts[key] = player_bucket_counts.get(key, 0) + 1
    
    print(f"   Calculated counts for {len(set(pid for pid, _ in player_bucket_counts.keys())):,} players")
    
    # Process each season
    all_season_results = []
    CURRENT_SEASON = "2025-26"
    
    # Get all seasons from master data
    all_seasons = set()
    for bucket_info in db.data.values():
        all_seasons.update(bucket_info['seasons'])
    
    print(f"📅 Processing {len(all_seasons)} seasons...")
    
    for season in sorted(all_seasons):
        print(f"   Processing {season}...")
        
        # Get all games for this season
        season_games = []
        for bucket_info in db.data.items():
            bucket_str, info = bucket_info
            for game in info['games']:
                if game['season'] == season:
                    season_games.append(game)
        
        if len(season_games) == 0:
            continue
        
        # Create DataFrame for this season
        season_df = pd.DataFrame(season_games)
        
        # Parse stats and create bucket keys using the same logic as data_utils.create_buckets
        # Stats format: PTS/REB/AST/BLK/STL
        stats_split = season_df['stats'].str.split('/', expand=True)
        season_df['points'] = stats_split[0].astype(int)
        season_df['rebounds'] = stats_split[1].astype(int)
        season_df['assists'] = stats_split[2].astype(int)
        season_df['blocks'] = stats_split[3].astype(int)
        season_df['steals'] = stats_split[4].astype(int)
        
        # Use the same bucket definitions as data_utils.create_buckets
        points_bins = [0, 5, 10, 15, 20, 25, 30, 40, 50, np.inf]
        assists_bins = [0, 2, 5, 8, 12, 20, np.inf]
        rebounds_bins = [0, 2, 5, 10, 15, 20, np.inf]
        blocks_bins = [0, 1, 3, 5, 7, np.inf]
        steals_bins = [0, 1, 3, 5, 7, np.inf]
        
        # Create bins exactly like data_utils.create_buckets does
        season_df["points_bin"] = pd.cut(season_df["points"], points_bins, labels=False, include_lowest=True)
        season_df["assists_bin"] = pd.cut(season_df["assists"], assists_bins, labels=False, include_lowest=True)
        season_df["rebounds_bin"] = pd.cut(season_df["rebounds"], rebounds_bins, labels=False, include_lowest=True)
        season_df["blocks_bin"] = pd.cut(season_df["blocks"], blocks_bins, labels=False, include_lowest=True)
        season_df["steals_bin"] = pd.cut(season_df["steals"], steals_bins, labels=False, include_lowest=True)
        
        # Create bucket keys exactly like data_utils.create_buckets
        season_df["bucket_key"] = list(zip(
            season_df["points_bin"],
            season_df["assists_bin"],
            season_df["rebounds_bin"],
            season_df["blocks_bin"],
            season_df["steals_bin"]
        ))
        
        # Split player names
        name_split = season_df['player'].str.split(n=1, expand=True)
        season_df['firstName'] = name_split[0]
        season_df['lastName'] = name_split[1]
        season_df['personId'] = season_df['personId'].astype(int)
        
        # Calculate SEASON-SPECIFIC bucket counts (like the original script)
        season_bucket_counts = season_df["bucket_key"].value_counts().to_dict()
        
        # Calculate SEASON-SPECIFIC per-player bucket counts (like the original script)
        season_player_bucket_counts = (
            season_df
            .groupby(["personId", "bucket_key"])
            .size()
            .to_dict()
        )
        
        # Compute weighted uniqueness using SEASON-SPECIFIC counts (like the original script)
        ALPHA = 0.10
        
        def compute_weighted_uniqueness(row):
            k = row["bucket_key"]
            pid = row["personId"]
            total = season_bucket_counts.get(k, 1)  # Use season-specific counts
            self_count = season_player_bucket_counts.get((pid, k), 0)  # Use season-specific counts
            effective_count = max(total - self_count, 1)
            return np.exp(-ALPHA * effective_count)
        
        season_df["weighted_uniqueness"] = season_df.apply(compute_weighted_uniqueness, axis=1)
        
        # Aggregate per player
        season_results = []
        for (pid, fname, lname), player_df in season_df.groupby(["personId", "firstName", "lastName"]):
            total_games = len(player_df)
            if total_games <= 15:  # Skip players with too few games
                continue
            
            season_results.append({
                "personId": pid,
                "firstName": fname,
                "lastName": lname,
                "season": season,
                "games": total_games,
                "avg_weighted_uniqueness": round(player_df["weighted_uniqueness"].mean(), 4)
            })
        
        if season_results:
            season_players_df = pd.DataFrame(season_results).sort_values(by="avg_weighted_uniqueness", ascending=False)
            all_season_results.append(season_players_df)
    
    if not all_season_results:
        print("❌ No season results found!")
        return
    
    # Combine all seasons
    print("📊 Combining all seasons...")
    all_players_df = pd.concat(all_season_results, ignore_index=True)
    
    # Save to Excel with separate sheets for each season
    output_file = "Uniqorn_Master.xlsx"
    
    print(f"💾 Saving to {output_file}...")
    
    with pd.ExcelWriter(output_file, engine="openpyxl") as writer:
        # Save each season as separate sheet
        for season_df in all_season_results:
            season_name = season_df.iloc[0]['season']
            season_df.to_excel(writer, sheet_name=season_name, index=False)
        
        # Also save combined data
        all_players_df.to_excel(writer, sheet_name="All_Seasons", index=False)
    
    print(f"✅ Seasonal Uniqorn Index saved: {output_file}")
    
    # Show statistics
    print(f"\n📈 Seasonal Uniqorn Index Statistics:")
    print(f"   Total players analyzed: {len(all_players_df):,}")
    print(f"   Seasons covered: {len(all_season_results)}")
    print(f"   Current season ({CURRENT_SEASON}) players: {len([s for s in all_season_results if s.iloc[0]['season'] == CURRENT_SEASON][0]) if CURRENT_SEASON in [s.iloc[0]['season'] for s in all_season_results] else 0}")
    
    # Show top players from current season
    current_season_df = next((s for s in all_season_results if s.iloc[0]['season'] == CURRENT_SEASON), None)
    if current_season_df is not None:
        print(f"\n🏆 Top {CURRENT_SEASON} Uniqorn Players:")
        top_players = current_season_df.head(10)
        for _, player in top_players.iterrows():
            print(f"   {player['firstName']} {player['lastName']}: {player['avg_weighted_uniqueness']:.4f} ({player['games']} games)")
    
    # Show all-time best seasons
    print(f"\n🌟 All-Time Best Uniqorn Seasons:")
    all_time_best = all_players_df.nlargest(10, 'avg_weighted_uniqueness')
    for _, player in all_time_best.iterrows():
        print(f"   {player['firstName']} {player['lastName']} ({player['season']}): {player['avg_weighted_uniqueness']:.4f}")
    
    print(f"\n🎉 Seasonal Uniqorn Index generation complete!")
    print(f"   File: {output_file}")
    print(f"   Sheets: {len(all_season_results) + 1} (seasons + combined)")
    print(f"   Generated using master database in <30 seconds")

def main():
    """Generate the seasonal Uniqorn index."""
    print("🚀 Seasonal Uniqorn Index Generator")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        generate_seasonal_uniqorn_index()
        print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ Error generating seasonal index: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
