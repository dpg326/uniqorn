"""
Generate a shortened bucket database for the frontend from the full master database.
Only includes current season games, limited to 10 games per bucket.
"""
import json

CURRENT_SEASON = "2025-26"
MAX_GAMES_PER_BUCKET = 10

def generate_frontend_bucket_db():
    print("Loading master bucket database...")
    with open("master_bucket_database.json", "r") as f:
        master_data = json.load(f)
    
    print(f"Loaded {len(master_data)} buckets")
    
    frontend_data = {}
    total_games = 0
    
    for bucket_str, bucket_info in master_data.items():
        # Filter to current season games only
        season_games = [g for g in bucket_info.get("games", []) if g.get("season") == CURRENT_SEASON]
        
        # Limit to MAX_GAMES_PER_BUCKET
        limited_games = season_games[:MAX_GAMES_PER_BUCKET]
        
        frontend_data[bucket_str] = {
            "count": len(season_games),
            "games": limited_games
        }
        
        total_games += len(season_games)
    
    # Count non-zero buckets
    non_zero = sum(1 for b in frontend_data.values() if b["count"] > 0)
    print(f"Total {CURRENT_SEASON} games: {total_games}")
    print(f"Buckets with games: {non_zero}")
    
    # Write to frontend
    output_path = "uniqorn-frontend/public/data/master_bucket_database.json"
    with open(output_path, "w") as f:
        json.dump(frontend_data, f, indent=2)
    
    import os
    size = os.path.getsize(output_path)
    print(f"Saved to {output_path}: {size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    generate_frontend_bucket_db()
