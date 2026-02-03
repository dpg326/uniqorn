import os
import pandas as pd
import kagglehub
from datetime import datetime, timedelta

CSV_PATH = "PlayerStatistics.csv"
CURRENT_SEASON = "2025-26"
DAYS_BACK = 3  # pull last 3 days to be safe

def load_existing_csv():
    print("Loading existing PlayerStatistics.csv...")
    df = pd.read_csv("PlayerStatistics.csv", low_memory=False)
    print(f"Loaded {len(df)} existing rows")
    return df

def pull_recent_kaggle():
    print("Downloading latest Kaggle snapshot...")
    path = kagglehub.dataset_download("eoinamoore/historical-nba-data-and-player-box-scores")
    print("Kaggle snapshot downloaded.")
    return pd.read_csv(os.path.join(path, "PlayerStatistics.csv"), low_memory=False)

def incremental_merge():
    existing = load_existing_csv()
    latest_date = pd.to_datetime(existing["gameDateTimeEst"], errors="coerce").max()
    if pd.isna(latest_date):
        raise ValueError("No valid gameDateTimeEst in existing CSV.")
    
    cutoff = latest_date - timedelta(days=DAYS_BACK)
    print(f"Latest local date: {latest_date.date()} | Pulling rows newer than {cutoff.date()}")
    fresh = pull_recent_kaggle()
    fresh["gameDateTimeEst"] = pd.to_datetime(fresh["gameDateTimeEst"], errors="coerce")
    new_rows = fresh[fresh["gameDateTimeEst"] > cutoff]

    if new_rows.empty:
        print("No new rows to add.")
        return existing

    print(f"Found {len(new_rows)} new rows to merge.")
    # Drop duplicates by a reasonable key
    merged = pd.concat([existing, new_rows], ignore_index=True)
    merged = merged.drop_duplicates(subset=["gameDateTimeEst", "personId", "playerteamName"])
    merged.to_csv(CSV_PATH, index=False)
    print(f"Added {len(new_rows)} new rows to {CSV_PATH}")
    return merged

if __name__ == "__main__":
    incremental_merge()
