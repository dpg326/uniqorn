"""
5D STATLINE UNIQUENESS — PERCENTILE-NORMAL METHOD

Each stat is:
1) Converted to percentile (empirical CDF)
2) Transformed to standard normal space
3) Combined into a single rarity score

This prevents blocks/steals from dominating.
"""

import pandas as pd
import numpy as np
from scipy.stats import norm, rankdata
from datetime import datetime
import unicodedata

CURRENT_SEASON = "2025-26"

STATS = {
    "points": "PTS",
    "reboundsTotal": "REB",
    "assists": "AST",
    "steals": "STL",
    "blocks": "BLK",
}

# ----------------------------------------------------
# Utilities
# ----------------------------------------------------

def normalize_name(name):
    if pd.isna(name):
        return name
    nfd = unicodedata.normalize("NFD", str(name))
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


# ----------------------------------------------------
# Data Loading
# ----------------------------------------------------

def load_current_season_data():
    print(f"Loading {CURRENT_SEASON} statlines...")

    df = pd.read_csv("PlayerStatistics.csv")

    df["gameDateTimeEst"] = pd.to_datetime(df["gameDateTimeEst"], errors="coerce")
    df = df.dropna(subset=["gameDateTimeEst"])

    SEASONS = {
        "2023-24": ("2023-10-01", "2024-04-13"),
        "2024-25": ("2024-10-01", "2025-04-13"),
        "2025-26": ("2025-10-21", "2026-04-13"),
    }

    def assign_season(date):
        for season, (start, end) in SEASONS.items():
            if pd.Timestamp(start) <= date <= pd.Timestamp(end):
                return season
        return None

    df["season"] = df["gameDateTimeEst"].apply(assign_season)
    df = df[df["season"] == CURRENT_SEASON].copy()

    df["firstName"] = df["firstName"].apply(normalize_name)
    df["lastName"] = df["lastName"].apply(normalize_name)

    for col in STATS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["blocks"] = df["blocks"].fillna(0)
    df["steals"] = df["steals"].fillna(0)

    df = df.dropna(subset=STATS)

    print(f"Loaded {len(df)} games")
    return df


# ----------------------------------------------------
# Percentile → Normal Transform
# ----------------------------------------------------

def stat_to_normal(series):
    """
    Convert raw stat to standard normal via empirical percentile.
    """
    pct = rankdata(series, method="average") / (len(series) + 1)
    return norm.ppf(pct)


def compute_transformed_stats(df):
    out = df.copy()

    for stat in STATS:
        out[f"{stat}_zn"] = stat_to_normal(out[stat])

    return out


def compute_uniqueness_score(df):
    zn_cols = [f"{s}_zn" for s in STATS]

    # Euclidean distance in normalized rarity space
    df["uniqueness_score"] = np.sqrt((df[zn_cols] ** 2).sum(axis=1))

    df["uniqueness_percentile"] = (
        rankdata(df["uniqueness_score"], method="average") / len(df) * 100
    )

    return df


# ----------------------------------------------------
# Output
# ----------------------------------------------------

def display_top_games(df, top_n=30):
    top = df.sort_values("uniqueness_score", ascending=False).head(top_n)

    print("\n" + "=" * 90)
    print("TOP MOST UNIQUE STATLINES — RARITY-NORMALIZED")
    print("=" * 90)

    for i, row in enumerate(top.itertuples(), 1):
        date = str(row.gameDateTimeEst)[:10]
        print(f"\n#{i} — {row.uniqueness_percentile:.2f} percentile")
        print(f"{row.firstName} {row.lastName} — {date}")
        print(
            f"{int(row.points)} PTS / {int(row.reboundsTotal)} REB / "
            f"{int(row.assists)} AST / {int(row.steals)} STL / {int(row.blocks)} BLK"
        )
        print(f"Uniqueness Score: {row.uniqueness_score:.3f}")

    print("\n" + "=" * 90)


def save_results(df):
    output = "rarity_normalized_statline_uniqueness(2025-26).csv"
    df.sort_values("uniqueness_score", ascending=False).to_csv(output, index=False)
    print(f"\n✓ Results saved to {output}")


# ----------------------------------------------------
# Main
# ----------------------------------------------------

def main():
    print("=" * 90)
    print("STATLINE UNIQUENESS — RARITY NORMALIZED METHOD")
    print("=" * 90)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    df = load_current_season_data()
    df = compute_transformed_stats(df)
    df = compute_uniqueness_score(df)

    display_top_games(df)
    save_results(df)

    print(f"\n✓ Completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
