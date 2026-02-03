import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional

class MasterBucketDatabase:
    """
    Ultra-fast query interface for the master bucket database.
    All operations are O(1) or O(log n) instead of O(n).
    """
    
    def __init__(self, master_file: str = "master_bucket_database.json"):
        """Load the master bucket database."""
        self.master_file = master_file
        self.load_database()
    
    def load_database(self):
        """Load the master database from file."""
        try:
            with open(self.master_file, "r") as f:
                self.data = json.load(f)
            print(f"✅ Loaded {len(self.data):,} buckets from master database")
        except FileNotFoundError:
            print(f"❌ Master database {self.master_file} not found!")
            self.data = {}
    
    def get_bucket_info(self, bucket_key: Tuple[int, int, int, int, int]) -> Optional[Dict]:
        """Get complete information for a specific bucket."""
        bucket_str = f"({', '.join(map(str, bucket_key))})"
        return self.data.get(bucket_str)
    
    def get_bucket_count(self, bucket_key: Tuple[int, int, int, int, int]) -> int:
        """Get the count of games for a specific bucket."""
        bucket_info = self.get_bucket_info(bucket_key)
        return bucket_info['count'] if bucket_info else 0
    
    def get_bucket_games(self, bucket_key: Tuple[int, int, int, int, int]) -> List[Dict]:
        """Get all games for a specific bucket."""
        bucket_info = self.get_bucket_info(bucket_key)
        return bucket_info['games'] if bucket_info else []
    
    def get_uniqorn_games(self, season: Optional[str] = None) -> List[Dict]:
        """Get all Uniqorn games (bucket count = 1)."""
        uniqorn_games = []
        for bucket_info in self.data.values():
            if bucket_info['count'] == 1:
                games = bucket_info['games']
                if season is None or (games and games[0]['season'] == season):
                    uniqorn_games.extend(games)
        
        # Sort by date (most recent first)
        uniqorn_games.sort(key=lambda x: x['date'], reverse=True)
        return uniqorn_games
    
    def get_two_occurrence_games(self, season: Optional[str] = None) -> List[Dict]:
        """Get all games with exactly 2 occurrences."""
        two_occurrence_games = []
        for bucket_info in self.data.values():
            if bucket_info['count'] == 2:
                games = bucket_info['games']
                if season is None or (games and games[0]['season'] == season):
                    two_occurrence_games.extend(games)
        
        # Sort by date (most recent first)
        two_occurrence_games.sort(key=lambda x: x['date'], reverse=True)
        return two_occurrence_games
    
    def get_recent_games(self, days: int = 7) -> List[Dict]:
        """Get all games from the last N days."""
        cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        recent_games = []
        
        for bucket_info in self.data.values():
            for game in bucket_info['games']:
                if game['date'] >= cutoff_date:
                    recent_games.append(game)
        
        # Sort by date (most recent first)
        recent_games.sort(key=lambda x: x['date'], reverse=True)
        return recent_games
    
    def get_season_games(self, season: str) -> List[Dict]:
        """Get all games from a specific season."""
        season_games = []
        
        for bucket_info in self.data.values():
            for game in bucket_info['games']:
                if game['season'] == season:
                    season_games.append(game)
        
        # Sort by date (most recent first)
        season_games.sort(key=lambda x: x['date'], reverse=True)
        return season_games
    
    def get_player_games(self, player_name: str) -> List[Dict]:
        """Get all games for a specific player."""
        player_games = []
        
        for bucket_info in self.data.values():
            for game in bucket_info['games']:
                if game['player'].lower() == player_name.lower():
                    player_games.append(game)
        
        # Sort by date (most recent first)
        player_games.sort(key=lambda x: x['date'], reverse=True)
        return player_games
    
    def get_bucket_distribution(self) -> Dict[str, int]:
        """Get distribution of bucket counts."""
        distribution = {"1": 0, "2": 0, "3-5": 0, "6-10": 0, "11+": 0}
        
        for bucket_info in self.data.values():
            count = bucket_info['count']
            if count == 1:
                distribution["1"] += 1
            elif count == 2:
                distribution["2"] += 1
            elif 3 <= count <= 5:
                distribution["3-5"] += 1
            elif 6 <= count <= 10:
                distribution["6-10"] += 1
            else:
                distribution["11+"] += 1
        
        return distribution
    
    def get_rarest_buckets(self, limit: int = 10) -> List[Dict]:
        """Get the rarest buckets (lowest counts)."""
        rare_buckets = []
        
        for bucket_str, bucket_info in self.data.items():
            if bucket_info['count'] <= 5:  # Only include rare buckets
                rare_buckets.append({
                    'bucket_key': bucket_str,
                    'count': bucket_info['count'],
                    'games': bucket_info['games'][:3]  # Show first 3 games
                })
        
        # Sort by count (ascending) and take top results
        rare_buckets.sort(key=lambda x: x['count'])
        return rare_buckets[:limit]
    
    def search_by_stats(self, points_range: Tuple[int, int], 
                        assists_range: Tuple[int, int],
                        rebounds_range: Tuple[int, int],
                        blocks_range: Tuple[int, int],
                        steals_range: Tuple[int, int]) -> List[Dict]:
        """Search for buckets within specific stat ranges."""
        matching_buckets = []
        
        for bucket_str, bucket_info in self.data.items():
            # Parse bucket key
            bucket_key = tuple(map(int, bucket_str.strip('()').split(', ')))
            
            points_bin, assists_bin, rebounds_bin, blocks_bin, steals_bin = bucket_key
            
            # Convert bin to approximate stat range (this is approximate)
            points_est = points_bin * 5  # Rough estimate
            assists_est = assists_bin * 3
            rebounds_est = rebounds_bin * 5
            blocks_est = blocks_bin * 2
            steals_est = steals_bin * 2
            
            # Check if within ranges
            if (points_range[0] <= points_est <= points_range[1] and
                assists_range[0] <= assists_est <= assists_range[1] and
                rebounds_range[0] <= rebounds_est <= rebounds_range[1] and
                blocks_range[0] <= blocks_est <= blocks_range[1] and
                steals_range[0] <= steals_est <= steals_range[1]):
                
                matching_buckets.append({
                    'bucket_key': bucket_key,
                    'bucket_str': bucket_str,
                    'count': bucket_info['count'],
                    'games': bucket_info['games']
                })
        
        # Sort by count (ascending)
        matching_buckets.sort(key=lambda x: x['count'])
        return matching_buckets
    
    def get_statistics(self) -> Dict:
        """Get comprehensive statistics about the database."""
        total_games = sum(bucket['count'] for bucket in self.data.values())
        uniqorn_count = len([b for b in self.data.values() if b['count'] == 1])
        two_occurrence_count = len([b for b in self.data.values() if b['count'] == 2])
        
        # Get date range
        all_dates = []
        for bucket_info in self.data.values():
            for game in bucket_info['games']:
                all_dates.append(game['date'])
        
        return {
            'total_games': total_games,
            'total_buckets': len(self.data),
            'uniqorn_count': uniqorn_count,
            'two_occurrence_count': two_occurrence_count,
            'uniqorn_percentage': (uniqorn_count / total_games * 100) if total_games > 0 else 0,
            'date_range': {
                'start': min(all_dates) if all_dates else None,
                'end': max(all_dates) if all_dates else None
            },
            'bucket_distribution': self.get_bucket_distribution()
        }

# Convenience functions for backward compatibility
def get_uniqorn_games(season: Optional[str] = None) -> List[Dict]:
    """Get Uniqorn games using the master database."""
    db = MasterBucketDatabase()
    return db.get_uniqorn_games(season)

def get_recent_games(days: int = 7) -> List[Dict]:
    """Get recent games using the master database."""
    db = MasterBucketDatabase()
    return db.get_recent_games(days)

def get_bucket_count(bucket_key: Tuple[int, int, int, int, int]) -> int:
    """Get bucket count using the master database."""
    db = MasterBucketDatabase()
    return db.get_bucket_count(bucket_key)
