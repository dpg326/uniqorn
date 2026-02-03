import os
import shutil
import time
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from data_utils import load_and_clean_data, create_buckets, get_bucket_description

# =====================
# CONFIG
# =====================
INPUT_FILE = "PlayerStatistics.csv"
OUTPUT_FILE = "Ultimate_Uniqorn_Games.xlsx"
CHART_FOLDER = "uniqorn-frontend/public/ultimate-charts"

# Load all data from 1973-74 onward (when blocks/steals were tracked)
print("Loading PlayerStatistics.csv...")
df = load_and_clean_data(INPUT_FILE, min_date="1973-10-01")

# Create buckets
df = create_buckets(df)

REGULAR_SEASONS = {
    "1973-74": ("1973-10-09", "1974-03-27"),
    "1974-75": ("1974-10-17", "1975-04-06"),
    "1975-76": ("1975-10-23", "1976-04-11"),
    "1976-77": ("1976-10-21", "1977-04-10"),
    "1977-78": ("1977-10-18", "1978-04-09"),
    "1978-79": ("1978-10-12", "1979-04-07"),
    "1979-80": ("1979-10-12", "1980-04-06"),
    "1980-81": ("1980-10-10", "1981-04-05"),
    "1981-82": ("1981-10-09", "1982-04-03"),
    "1982-83": ("1982-10-08", "1983-04-06"),
    "1983-84": ("1983-10-11", "1984-04-08"),
    "1984-85": ("1984-10-12", "1985-04-07"),
    "1985-86": ("1985-10-25", "1986-04-06"),
    "1986-87": ("1986-10-31", "1987-04-04"),
    "1987-88": ("1987-11-06", "1988-04-09"),
    "1988-89": ("1988-11-04", "1989-04-23"),
    "1989-90": ("1989-11-03", "1990-04-22"),
    "1990-91": ("1990-11-02", "1991-04-21"),
    "1991-92": ("1991-11-01", "1992-04-19"),
    "1992-93": ("1992-11-06", "1993-04-25"),
    "1993-94": ("1993-11-05", "1994-04-24"),
    "1994-95": ("1994-11-04", "1995-04-23"),
    "1995-96": ("1995-11-03", "1996-04-21"),
    "1996-97": ("1996-11-01", "1997-04-20"),
    "1997-98": ("1997-10-31", "1998-04-19"),
    "1998-99": ("1998-10-30", "1999-04-18"),
    "1999-00": ("1999-11-02", "2000-04-16"),
    "2000-01": ("2000-10-31", "2001-04-15"),
    "2001-02": ("2001-10-30", "2002-04-14"),
    "2002-03": ("2002-10-29", "2003-04-16"),
    "2003-04": ("2003-10-28", "2004-04-14"),
    "2004-05": ("2004-11-02", "2005-04-20"),
    "2005-06": ("2005-11-01", "2006-04-19"),
    "2006-07": ("2006-10-31", "2007-04-18"),
    "2007-08": ("2007-10-30", "2008-04-16"),
    "2008-09": ("2008-10-28", "2009-04-15"),
    "2009-10": ("2009-10-27", "2010-04-14"),
    "2010-11": ("2010-10-26", "2011-04-13"),
    "2011-12": ("2011-12-25", "2012-04-26"),
    "2012-13": ("2012-10-30", "2013-04-17"),
    "2013-14": ("2013-10-29", "2014-04-16"),
    "2014-15": ("2014-10-28", "2015-04-15"),
    "2015-16": ("2015-10-27", "2016-04-13"),
    "2016-17": ("2016-10-25", "2017-04-12"),
    "2017-18": ("2017-10-17", "2018-04-11"),
    "2018-19": ("2018-10-16", "2019-04-10"),
    "2019-20": ("2019-10-22", "2020-03-11"),
    "2020-21": ("2020-12-22", "2021-05-16"),
    "2021-22": ("2021-10-19", "2022-04-10"),
    "2022-23": ("2022-10-18", "2023-04-09"),
    "2023-24": ("2023-10-24", "2024-04-14"),
    "2024-25": ("2024-10-22", "2025-04-13"),
    "2025-26": ("2025-10-21", "2026-04-12"),
}

def assign_season(date: pd.Timestamp) -> str | None:
    for season, (start, end) in REGULAR_SEASONS.items():
        if pd.Timestamp(start) <= date <= pd.Timestamp(end):
            return season
    return None

print("Assigning seasons to 1.4M rows (this may take a moment)...")
df["season"] = df["gameDateTimeEst"].apply(assign_season)
df = df.dropna(subset=["season"])
print(f"Season assignment complete: {len(df)} rows with valid seasons")

# Bucket definitions needed for chart generation
points_bins = [0, 5, 10, 15, 20, 25, 30, 40, 50, np.inf]
assists_bins = [0, 2, 5, 8, 12, 20, np.inf]
rebounds_bins = [0, 2, 5, 10, 15, 20, np.inf]
blocks_bins = [0, 1, 3, 5, 7, np.inf]
steals_bins = [0, 1, 3, 5, 7, np.inf]

print("Finding all-time uniqorn buckets...")

bucket_counts = df["bucket_key"].value_counts()
uniqorn_buckets = bucket_counts[bucket_counts == 1].index
uniqorns = df[df["bucket_key"].isin(uniqorn_buckets)].copy()

print(f" Found {len(uniqorns)} all-time uniqorn games.")

# Export spreadsheet
uniqorns_export = (
    uniqorns[[
        "season",
        "gameDateTimeEst",
        "firstName",
        "lastName",
        "playerteamName",
        "opponentteamName",
        "points",
        "assists",
        "reboundsTotal",
        "blocks",
        "steals",
    ]]
    .sort_values("gameDateTimeEst", ascending=False)
    .rename(columns={"gameDateTimeEst": "game_date", "reboundsTotal": "rebounds"})
)

uniqorns_export.to_excel(OUTPUT_FILE, index=False)
print(f" Spreadsheet saved: {OUTPUT_FILE}")

# Clean old charts
# Ensure chart folder exists (don't delete existing charts)
os.makedirs(CHART_FOLDER, exist_ok=True)

# Plotly radar generation
stats = ["points_bin", "assists_bin", "rebounds_bin", "blocks_bin", "steals_bin"]
labels = ["PTS", "AST", "REB", "BLK", "STL"]
max_bucket = max(
    len(points_bins) - 2,
    len(assists_bins) - 2,
    len(rebounds_bins) - 2,
    len(blocks_bins) - 2,
    len(steals_bins) - 2,
)

accent = "rgb(56, 189, 248)"

# Clean up invalid charts (playoffs, wrong dates, etc.) - ONLY in ultimate-charts folder
print("Cleaning up invalid ultimate charts...")
if os.path.exists(CHART_FOLDER):
    existing_files = set(os.listdir(CHART_FOLDER))
    valid_files = set()
    
    for _, row in uniqorns.iterrows():
        filename = f"{row['firstName']}_{row['lastName']}_{row['gameDateTimeEst'].date()}.png"
        valid_files.add(filename)
    
    # Delete files that shouldn't exist (ONLY ultimate charts)
    files_to_delete = existing_files - valid_files
    for file in files_to_delete:
        if file.endswith('.png'):
            file_path = os.path.join(CHART_FOLDER, file)
            os.remove(file_path)
            print(f"Deleted invalid ultimate chart: {file}")
    
    print(f"Cleaned up {len(files_to_delete)} invalid ultimate charts")

print("Generating radar charts...")
charts_generated = 0
charts_skipped = 0

for _, row in uniqorns.iterrows():
    values = [int(row[s]) for s in stats]
    values_closed = values + [values[0]]
    labels_closed = labels + [labels[0]]

    title = f"{row['firstName']} {row['lastName']} vs {row['opponentteamName']} ({row['gameDateTimeEst'].date()})"

    fig = go.Figure(
        data=[
            go.Scatterpolar(
                r=values_closed,
                theta=labels_closed,
                fill="toself",
                fillcolor="rgba(56, 189, 248, 0.20)",
                line=dict(color=accent, width=3),
                marker=dict(color=accent, size=6),
            )
        ]
    )

    fig.update_layout(
        template="plotly_dark",
        title=dict(text=title, x=0.5, xanchor="center", font=dict(size=14, color="rgba(224, 242, 254, 1)")),
        margin=dict(l=40, r=40, t=70, b=40),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        polar=dict(
            bgcolor="rgba(0,0,0,0)",
            radialaxis=dict(range=[0, max_bucket], showticklabels=True, tickfont=dict(color="rgba(228,228,231,1)")),
            angularaxis=dict(tickfont=dict(color="rgba(224,242,254,1)")),
        ),
        showlegend=False,
    )

    filename = f"{row['firstName']}_{row['lastName']}_{row['gameDateTimeEst'].date()}.png"
    out_path = os.path.join(CHART_FOLDER, filename)
    if not os.path.exists(out_path):
        # Add retry logic for chart generation
        max_retries = 3
        for attempt in range(max_retries):
            try:
                fig.write_image(out_path, width=700, height=700, scale=2)
                charts_generated += 1
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"Failed to generate chart for {filename} after {max_retries} attempts: {e}")
                    charts_skipped += 1
                else:
                    print(f"Retry {attempt + 1} for {filename}...")
                    time.sleep(1)  # Wait before retry
    else:
        charts_skipped += 1

print(f"Generated {charts_generated} new charts")
print(f"Skipped {charts_skipped} existing charts")

print(f" Radar charts saved to: {CHART_FOLDER}")
print("Ultimate Uniqorn generation complete!")
