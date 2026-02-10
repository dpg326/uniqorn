"""
5D KDE Analysis - Find Most Distant Statline (2024-25 Season)
Uses Kernel Density Estimation to find the most unique performance in 2024-25 season
based on 5D feature space: Points, Rebounds, Assists, Steals, Blocks

This analyzes ALL statlines from the 2024-25 season, not just UNIQORN games.
"""

import pandas as pd
import numpy as np
from scipy.stats import gaussian_kde
from datetime import datetime
import unicodedata

CURRENT_SEASON = '2024-25'

def normalize_name(name):
    """Normalize player names by removing diacritics"""
    if pd.isna(name):
        return name
    nfd = unicodedata.normalize('NFD', str(name))
    return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')

def load_current_season_data():
    """Load ALL current season game data from PlayerStatistics.csv"""
    print(f"Loading ALL statlines from {CURRENT_SEASON} season from PlayerStatistics.csv...")
    
    # Load from CSV which has full historical data
    df = pd.read_csv('PlayerStatistics.csv', low_memory=False)
    
    # Convert date column
    df['gameDateTimeEst'] = pd.to_datetime(df['gameDateTimeEst'], errors='coerce')
    df = df.dropna(subset=['gameDateTimeEst'])
    
    # Assign season based on date
    REGULAR_SEASONS = {
        "2023-24": ("2023-10-01", "2024-04-13"),
        "2024-25": ("2024-10-01", "2025-04-13"),
        "2025-26": ("2025-10-01", "2026-04-13"),
    }
    
    def assign_season(date):
        for season, (start, end) in REGULAR_SEASONS.items():
            if pd.Timestamp(start) <= date <= pd.Timestamp(end):
                return season
        return None
    
    df['season'] = df['gameDateTimeEst'].apply(assign_season)
    df = df.dropna(subset=['season'])
    
    # Filter for current season
    df_current = df[df['season'] == CURRENT_SEASON].copy()
    
    # Normalize player names
    df_current['firstName'] = df_current['firstName'].apply(normalize_name)
    df_current['lastName'] = df_current['lastName'].apply(normalize_name)
    
    # Ensure numeric columns
    numeric_cols = ['points', 'assists', 'reboundsTotal', 'blocks', 'steals']
    for col in numeric_cols:
        if col in df_current.columns:
            df_current[col] = pd.to_numeric(df_current[col], errors='coerce')
    
    # Fill missing blocks/steals with 0
    if 'blocks' in df_current.columns:
        df_current['blocks'] = df_current['blocks'].fillna(0)
    if 'steals' in df_current.columns:
        df_current['steals'] = df_current['steals'].fillna(0)
    
    # Drop any rows with missing stats
    df_current = df_current.dropna(subset=numeric_cols)
    
    print(f"Loaded {len(df_current)} games from {CURRENT_SEASON} season")
    print(f"Unique players: {df_current['personId'].nunique()}")
    
    return df_current

def prepare_5d_features(df):
    """Extract 5D feature space: PTS, REB, AST, STL, BLK"""
    # Handle different column names (reboundsTotal from NBA API, rebounds from Excel)
    reb_col = 'reboundsTotal' if 'reboundsTotal' in df.columns else 'rebounds'
    features = df[['points', reb_col, 'assists', 'steals', 'blocks']].values
    print(f"Prepared 5D feature space with shape: {features.shape}")
    return features

def fit_kde_and_calculate_densities(features):
    """
    Fit 5D KDE model and calculate density for each performance
    Lower density = more distant/unique performance
    """
    print("\nFitting 5D Kernel Density Estimation model...")
    print("This may take a moment for large datasets...")
    
    # Transpose for scipy KDE (expects features as rows)
    kde = gaussian_kde(features.T)
    
    print("Calculating density for each performance...")
    # Calculate log density for numerical stability
    log_densities = kde.logpdf(features.T)
    densities = np.exp(log_densities)
    
    print(f"Density range: {densities.min():.2e} to {densities.max():.2e}")
    return densities

def find_most_distant_performances(df, densities, top_n=30):
    """Find performances with lowest density (most distant/unique)"""
    df_with_density = df.copy()
    df_with_density['kde_density'] = densities
    
    # Sort by density (ascending = most unique first)
    most_unique = df_with_density.nsmallest(top_n, 'kde_density')
    
    return most_unique

def display_results(most_unique):
    """Display the most unique performances"""
    print("\n" + "="*80)
    print(f"TOP {len(most_unique)} MOST DISTANT STATLINES (Lowest KDE Density)")
    print("="*80)
    
    for idx, (i, row) in enumerate(most_unique.iterrows(), 1):
        print(f"\n#{idx} - Density: {row['kde_density']:.2e}")
        print(f"Player: {row['firstName']} {row['lastName']}")
        # Handle different date column names
        if 'gameDate' in row:
            date_str = row['gameDate']
        elif 'game_date' in row:
            date_str = row['game_date']
        else:
            date_str = str(row['gameDateTimeEst'])[:10]  # Extract date from datetime
        print(f"Date: {date_str}")
        reb_col = 'reboundsTotal' if 'reboundsTotal' in row else 'rebounds'
        print(f"Stats: {int(row['points'])} PTS / {int(row[reb_col])} REB / {int(row['assists'])} AST / {int(row['steals'])} STL / {int(row['blocks'])} BLK")
        if 'playerteamName' in row and pd.notna(row['playerteamName']):
            print(f"Team: {row['playerteamName']} vs {row['opponentteamName']}")
        print(f"Season: {row['season']}")
    
    print("\n" + "="*80)
    
    # Show the #1 most unique
    most_distant = most_unique.iloc[0]
    # Handle different date column names
    if 'gameDate' in most_distant:
        date_str = most_distant['gameDate']
    elif 'game_date' in most_distant:
        date_str = most_distant['game_date']
    else:
        date_str = str(most_distant['gameDateTimeEst'])[:10]
    reb_col = 'reboundsTotal' if 'reboundsTotal' in most_distant else 'rebounds'
    print("\n🏆 MOST DISTANT STATLINE (Lowest Density):")
    print(f"   {most_distant['firstName']} {most_distant['lastName']} - {date_str}")
    print(f"   {int(most_distant['points'])} PTS / {int(most_distant[reb_col])} REB / {int(most_distant['assists'])} AST / {int(most_distant['steals'])} STL / {int(most_distant['blocks'])} BLK")
    print(f"   KDE Density: {most_distant['kde_density']:.2e}")
    print("="*80)

def save_results(most_unique):
    """Save results to CSV"""
    output_file = 'kde_most_unique_performances_2024_25.csv'
    most_unique.to_csv(output_file, index=False)
    print(f"\n✓ Results saved to: {output_file}")

def main():
    print("="*80)
    print("5D KDE ANALYSIS - FINDING MOST DISTANT STATLINES (2024-25 SEASON)")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Load data
    df = load_current_season_data()
    
    # Prepare 5D feature space
    features = prepare_5d_features(df)
    
    # Fit KDE and calculate densities
    densities = fit_kde_and_calculate_densities(features)
    
    # Find most distant performances
    most_unique = find_most_distant_performances(df, densities, top_n=30)
    
    # Display results
    display_results(most_unique)
    
    # Save results
    save_results(most_unique)
    
    print(f"\n✓ Analysis complete at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
