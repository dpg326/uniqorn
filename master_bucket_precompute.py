import json
import time
from datetime import datetime

import pandas as pd

from data_utils import load_and_clean_data, create_buckets


INPUT_FILE = "PlayerStatistics.csv"
MASTER_FILE = "master_bucket_database.json"
SUMMARY_FILE = "master_bucket_summary.json"


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


def master_bucket_precompute():
    start_time = time.time()
    print("📦 Master Bucket Precompute")
    print("=" * 60)

    print("📊 Loading and cleaning data...")
    df = load_and_clean_data(INPUT_FILE, min_date="1973-10-01")

    print("🔢 Creating buckets...")
    df = create_buckets(df)

    print("📅 Assigning seasons...")
    df["season"] = df["gameDateTimeEst"].apply(assign_season)
    df = df.dropna(subset=["season"]).copy()

    df = df.sort_values("gameDateTimeEst", ascending=False)

    master_data: dict[str, dict] = {}

    min_date = None
    max_date = None
    players_set: dict[str, set] = {}
    seasons_set: dict[str, set] = {}

    print(f"🏀 Building master database from {len(df):,} rows...")

    for row in df.itertuples(index=False):
        bucket_key = getattr(row, "bucket_key")
        bucket_str = f"({', '.join(map(str, bucket_key))})"

        dt = getattr(row, "gameDateTimeEst")
        date_str = pd.to_datetime(dt).strftime("%Y-%m-%d")

        if max_date is None or date_str > max_date:
            max_date = date_str
        if min_date is None or date_str < min_date:
            min_date = date_str

        fn = getattr(row, "firstName")
        ln = getattr(row, "lastName")
        player = f"{fn} {ln}".strip()

        game_record = {
            "player": player,
            "date": date_str,
            "stats": f"{int(getattr(row, 'points'))}/{int(getattr(row, 'assists'))}/{int(getattr(row, 'reboundsTotal'))}/{int(getattr(row, 'blocks'))}/{int(getattr(row, 'steals'))}",
            "team": getattr(row, "playerteamName"),
            "opponent": getattr(row, "opponentteamName"),
            "season": getattr(row, "season"),
            "personId": int(getattr(row, "personId")),
        }

        if bucket_str not in master_data:
            master_data[bucket_str] = {
                "count": 1,
                "games": [game_record],
                "seasons": [game_record["season"]],
                "players": [player],
            }
            seasons_set[bucket_str] = {game_record["season"]}
            players_set[bucket_str] = {player}
        else:
            master_data[bucket_str]["count"] += 1
            master_data[bucket_str]["games"].append(game_record)

            if game_record["season"] not in seasons_set[bucket_str]:
                seasons_set[bucket_str].add(game_record["season"])
                master_data[bucket_str]["seasons"].append(game_record["season"])

            if player not in players_set[bucket_str]:
                players_set[bucket_str].add(player)
                master_data[bucket_str]["players"].append(player)

    print("💾 Saving master database...")
    with open(MASTER_FILE, "w") as f:
        json.dump(master_data, f)

    print("📈 Writing summary...")
    total_games = sum(b["count"] for b in master_data.values())
    uniqorn_count = sum(1 for b in master_data.values() if b.get("count") == 1)
    two_occurrence_count = sum(1 for b in master_data.values() if b.get("count") == 2)

    all_seasons = set()
    for b in master_data.values():
        all_seasons.update(b.get("seasons", []))

    summary = {
        "total_games": total_games,
        "total_buckets": len(master_data),
        "total_seasons": len(all_seasons),
        "date_range": {"start": min_date, "end": max_date},
        "uniqorn_count": uniqorn_count,
        "two_occurrence_count": two_occurrence_count,
        "last_updated": datetime.now().isoformat(),
        "bucket_distribution": {
            "1": sum(1 for b in master_data.values() if b.get("count") == 1),
            "2": sum(1 for b in master_data.values() if b.get("count") == 2),
            "3-5": sum(1 for b in master_data.values() if 3 <= int(b.get("count", 0)) <= 5),
            "6-10": sum(1 for b in master_data.values() if 6 <= int(b.get("count", 0)) <= 10),
            "11+": sum(1 for b in master_data.values() if int(b.get("count", 0)) >= 11),
        },
    }

    with open(SUMMARY_FILE, "w") as f:
        json.dump(summary, f, indent=2)

    duration = time.time() - start_time
    print("=" * 60)
    print("✅ Master precompute complete")
    print(f"   Duration: {duration:.2f}s")
    print(f"   Total games: {summary['total_games']:,}")
    print(f"   Total buckets: {summary['total_buckets']:,}")
    print(f"   Date range: {summary['date_range']['start']} to {summary['date_range']['end']}")
    print(f"   Output: {MASTER_FILE}")
    print(f"   Output: {SUMMARY_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    master_bucket_precompute()
