import pandas as pd
import numpy as np

def standardize_deduplication(df, source="unknown"):
    """
    Standard deduplication logic for all scripts.
    Removes duplicates based on player, date (not time), team, and stats.
    """
    initial_rows = len(df)
    
    # Add date column for deduplication (ignore time)
    df['gameDate'] = df['gameDateTimeEst'].dt.date
    
    # Deduplication key using date only (not datetime)
    dedup_key = ["personId", "gameDate", "playerteamName", "points", "assists", "reboundsTotal", "blocks", "steals"]
    
    # Ensure all key columns exist
    available_key = [col for col in dedup_key if col in df.columns]
    
    if len(available_key) < 3:  # At minimum need personId, date, and team
        print(f"Warning: Insufficient columns for deduplication in {source}")
        return df
    
    df_deduped = df.drop_duplicates(subset=available_key, keep="first")
    deduped_rows = len(df_deduped)
    
    print(f"{source} deduplication: {initial_rows} -> {deduped_rows} rows (removed {initial_rows - deduped_rows} duplicates)")
    
    return df_deduped

def load_and_clean_data(input_file="PlayerStatistics.csv", filter_season=None, min_date=None):
    """
    Standard data loading and cleaning for all scripts.
    """
    print(f"Loading data from {input_file}")
    df = pd.read_csv(input_file, low_memory=False)
    
    # Convert dates
    df["gameDateTimeEst"] = pd.to_datetime(df["gameDateTimeEst"], errors="coerce")
    df = df.dropna(subset=["gameDateTimeEst"])

    if "reboundsTotal" in df.columns and "rebounds" in df.columns:
        df["reboundsTotal"] = df["reboundsTotal"].fillna(df["rebounds"])
    if "blocks" in df.columns:
        df["blocks"] = df["blocks"].fillna(0)
    if "steals" in df.columns:
        df["steals"] = df["steals"].fillna(0)

    numeric_cols = [c for c in ["points", "assists", "reboundsTotal", "blocks", "steals"] if c in df.columns]
    if numeric_cols:
        df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors="coerce")
    
    # Filter by date if specified
    if min_date:
        df = df[df["gameDateTimeEst"] >= pd.Timestamp(min_date)]
        print(f"Filtered to dates >= {min_date}: {len(df)} rows")
    
    # Assign season if needed
    if filter_season:
        REGULAR_SEASONS = {
            "2023-24": ("2023-10-01", "2024-04-13"),
            "2024-25": ("2024-10-01", "2025-04-13"),
            "2025-26": ("2025-10-01", "2026-04-13"),
        }
        
        def assign_season(date: pd.Timestamp) -> str | None:
            for season, (start, end) in REGULAR_SEASONS.items():
                if pd.Timestamp(start) <= date <= pd.Timestamp(end):
                    return season
            return None
        
        df["season"] = df["gameDateTimeEst"].apply(assign_season)
        df = df.dropna(subset=["season"])
        df = df[df["season"] == filter_season]
        print(f"Filtered to season {filter_season}: {len(df)} rows")
    
    # Standard deduplication
    df = standardize_deduplication(df, f"load_and_clean({filter_season or 'all'})")
    
    return df

def create_buckets(df):
    """
    Standard bucket creation for all scripts.
    """
    points_bins = [0, 5, 10, 15, 20, 25, 30, 40, 50, np.inf]
    assists_bins = [0, 2, 5, 8, 12, 20, np.inf]
    rebounds_bins = [0, 2, 5, 10, 15, 20, np.inf]
    blocks_bins = [0, 1, 3, 5, 7, np.inf]
    steals_bins = [0, 1, 3, 5, 7, np.inf]
    
    STAT_COLS = ["points", "assists", "reboundsTotal", "blocks", "steals"]

    numeric_cols = [c for c in STAT_COLS if c in df.columns]
    if numeric_cols:
        df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors="coerce")
    if "reboundsTotal" in df.columns and "rebounds" in df.columns:
        df["reboundsTotal"] = df["reboundsTotal"].fillna(df["rebounds"])
    if "blocks" in df.columns:
        df["blocks"] = df["blocks"].fillna(0)
    if "steals" in df.columns:
        df["steals"] = df["steals"].fillna(0)
    
    # Filter to games where all stats are available
    initial_rows = len(df)
    df = df.dropna(subset=STAT_COLS)
    print(f"Filtered to complete stats: {initial_rows} -> {len(df)} rows")
    
    # Create buckets
    df["points_bin"] = pd.cut(df["points"], points_bins, labels=False, include_lowest=True)
    df["assists_bin"] = pd.cut(df["assists"], assists_bins, labels=False, include_lowest=True)
    df["rebounds_bin"] = pd.cut(df["reboundsTotal"], rebounds_bins, labels=False, include_lowest=True)
    df["blocks_bin"] = pd.cut(df["blocks"], blocks_bins, labels=False, include_lowest=True)
    df["steals_bin"] = pd.cut(df["steals"], steals_bins, labels=False, include_lowest=True)
    
    # Remove any rows with missing bins
    df = df.dropna(subset=["points_bin", "assists_bin", "rebounds_bin", "blocks_bin", "steals_bin"])
    
    # Convert to integers
    df[["points_bin", "assists_bin", "rebounds_bin", "blocks_bin", "steals_bin"]] = df[
        ["points_bin", "assists_bin", "rebounds_bin", "blocks_bin", "steals_bin"]
    ].astype(int)
    
    # Create bucket key
    df["bucket_key"] = list(
        zip(df["points_bin"], df["assists_bin"], df["rebounds_bin"], df["blocks_bin"], df["steals_bin"])
    )
    
    print(f"Created buckets: {len(df)} rows with valid bucket keys")
    
    return df

def get_bucket_description(bucket_key):
    """Get a readable description of the bucket ranges"""
    # Actual bucket boundaries based on pandas cut behavior
    points_bins = [0, 5, 10, 15, 20, 25, 30, 40, 50, np.inf]
    assists_bins = [0, 2, 5, 8, 12, 20, np.inf]
    rebounds_bins = [0, 2, 5, 10, 15, 20, np.inf]
    blocks_bins = [0, 1, 3, 5, 7, np.inf]
    steals_bins = [0, 1, 3, 5, 7, np.inf]
    
    # Correct ranges based on pandas cut behavior (include_lowest=True)
    points_ranges = ["0-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31-40", "41-50", "51+"]
    assists_ranges = ["0-2", "3-5", "6-8", "9-12", "13-20", "21+"]
    rebounds_ranges = ["0-2", "3-5", "6-10", "11-15", "16-20", "21+"]
    blocks_ranges = ["0-1", "2-3", "4-5", "6-7", "8+"]
    steals_ranges = ["0-1", "2-3", "4-5", "6-7", "8+"]
    
    points_range = points_ranges[bucket_key[0]] if bucket_key[0] < len(points_ranges) else "50+"
    assists_range = assists_ranges[bucket_key[1]] if bucket_key[1] < len(assists_ranges) else "20+"
    rebounds_range = rebounds_ranges[bucket_key[2]] if bucket_key[2] < len(rebounds_ranges) else "20+"
    blocks_range = blocks_ranges[bucket_key[3]] if bucket_key[3] < len(blocks_ranges) else "7+"
    steals_range = steals_ranges[bucket_key[4]] if bucket_key[4] < len(steals_ranges) else "7+"
    
    return f"PTS {points_range} | AST {assists_range} | REB {rebounds_range} | BLK {blocks_range} | STL {steals_range}"
