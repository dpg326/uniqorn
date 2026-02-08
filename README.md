# Uniqorn - NBA Statistical Uniqueness Tracker

A system that tracks statistically unique NBA performances using bucket-based analysis. Identifies "Uniqorn" games - performances that no other player in NBA history has ever matched.

## Architecture

### Core Components

#### Data Pipeline
- **`fast_daily_pipeline.py`** - Main daily pipeline
  - Fetches new games from NBA API
  - Updates master bucket database
  - Generates all frontend data files
  - Copies files to frontend
  - **Run daily during NBA season**

- **`master_bucket_precompute.py`** - Rebuilds entire master database
  - Processes all historical games since 1973 from `PlayerStatistics.csv`
  - Creates `master_bucket_database.json`
  - **Run once on initial setup or if database is corrupted**

- **`nba_api_data.py`** - NBA API data fetching module
  - Fetches player game logs from official NBA API
  - Used by `fast_daily_pipeline.py` for daily updates

#### Utilities
- **`data_utils.py`** - Data loading, cleaning, and bucket creation
- **`master_bucket_utils.py`** - Interface for querying master bucket database
- **`incremental_update_new.py`** - Incremental database updates (called by pipeline)
- **`generate_seasonal_uniqorn_index.py`** - Creates seasonal Uniqorn index

#### Frontend
- **`uniqorn-frontend/`** - Next.js web application
  - Displays current season Uniqorn games
  - Shows all-time leaders and Ultimate Uniqorns
  - Interactive charts and game details

##  Important Files

### Database Files
- `master_bucket_database.json` - Complete historical bucket database (2M+ games)
- `master_bucket_summary.json` - Database statistics and metadata

### Frontend Data Files (Generated Daily)
- `Uniqorn_Master.xlsx` - Seasonal and all-time Uniqorn leaders
- `Most_Recent_Games_Master.xlsx` - Recent Uniqorn games with details
- `CurrentSeason_UniqornGames_Master.xlsx` - Current season Uniqorn games
- `Ultimate_Uniqorn_Games_Master.xlsx` - All-time Ultimate Uniqorn games
- `Ultimate_Uniqorn_Leaderboard_Master.xlsx` - Ultimate Uniqorn rankings
- `ultimate_changes_master.json` - Daily changes to Ultimate Uniqorn list

### Static Data
- `PlayerStatistics.csv` - Raw player game data (updated from Kaggle)
- `Players.csv` - Player metadata
- `TeamHistories.csv` - Team historical data
- `TeamStatistics.csv` - Team statistics

## 🚀 Setup & Startup

### First Time Setup
```bash
# 1. Install Python dependencies
pip install pandas numpy openpyxl nba-api

# 2. Build master database (takes 10-20 minutes)
python master_bucket_precompute.py

# 3. Install frontend dependencies
cd uniqorn-frontend
npm install
cd ..

# 4. Generate initial frontend data
python fast_daily_pipeline.py

# 5. Start frontend
cd uniqorn-frontend
npm run dev
```

### Daily Operations (During NBA Season)
```bash
# 1. Run the daily pipeline (fetches from NBA API, updates database, generates files)
python fast_daily_pipeline.py

# 2. Copy updated files to frontend
copy Most_Recent_Games_Master.xlsx uniqorn-frontend\public\data\
copy CurrentSeason_UniqornGames_Master.xlsx uniqorn-frontend\public\data\
copy Ultimate_Uniqorn_Games_Master.xlsx uniqorn-frontend\public\data\
copy Uniqorn_Master.xlsx uniqorn-frontend\public\data\

# 3. Generate bucket search database (shortened version for frontend from master DB)
python generate_frontend_bucket_db.py

# 4. Commit and push changes to GitHub
git add -A
git commit -m "Daily update: YYYY-MM-DD"
git push

# 5. Restart frontend to see latest data (if running in dev mode)
cd uniqorn-frontend
npm run dev
```

**One-liner for daily update:**
```bash
python fast_daily_pipeline.py && copy *.xlsx uniqorn-frontend\public\data\ && python generate_frontend_bucket_db.py && git add -A && git commit -m "Daily update" && git push
```

## 📊 Pipeline Flow

```
NBA API (Official)
    ↓
fast_daily_pipeline.py (daily)
    ├── Fetches new games via nba_api_data.py
    ├── Updates master_bucket_database.json
    ├── Generates *_Master.xlsx files
    └── Updates ultimate_changes_master.json
    ↓
Copy files to uniqorn-frontend/public/data/
    ↓
Frontend reads updated files
    ↓
Web displays updated data
```

**Historical Data Flow (one-time setup):**
```
PlayerStatistics.csv (Kaggle historical data)
    ↓
master_bucket_precompute.py
    ↓
master_bucket_database.json (1.2M+ games since 1973)
```

##  Key Concepts

### Bucket System
- Each game is categorized by a 5-tuple: (points, assists, rebounds, blocks, steals)
- Buckets represent unique statistical combinations
- "Uniqorn" = bucket with only 1 occurrence in NBA history
- "Two-Occurrence" = bucket with exactly 2 occurrences

### Ultimate Uniqorn
- Players with multiple Uniqorn games
- Extremely rare (currently ~200 players total)
- Tracked across entire NBA history

### Master Database
- Pre-computed bucket database for fast queries
- Contains ~2.6M games across all seasons
- Enables 10-100x performance improvement over legacy pipeline

##  Maintenance

### Database Recovery
If `master_bucket_database.json` is lost or corrupted:
```bash
python master_bucket_precompute.py
```

### Season Updates
Update `CURRENT_SEASON` and season date ranges in:
- `nba_api_data.py` - CURRENT_SEASON constant
- `fast_daily_pipeline.py` - CURRENT_SEASON constant
- `master_bucket_precompute.py` - REGULAR_SEASONS dict
- `generate_seasonal_uniqorn_index.py` - CURRENT_SEASON constant

### Archive
Old pipeline files and outputs are stored in `archive/` for reference.

##  Performance

- **Daily Pipeline**: ~2-3 minutes (NBA API fetch + processing)
- **Master Database**: 1.2M+ games, 2.6K buckets
- **NBA API Fetch**: ~15-20 seconds (single API call for all players)

##  Troubleshooting

### Common Issues
1. **Missing master database** - Run `master_bucket_precompute.py`
2. **Frontend not updating** - Copy files to `uniqorn-frontend/public/data/` and restart dev server
3. **NBA API timeout** - Wait a few seconds and retry (rate limiting)
4. **Corrupted JSON** - Restore from `uniqorn-frontend/public/data/` backup or rebuild

### Logs
- Pipeline output shows detailed progress and statistics
- Frontend dev server shows API errors
- Check file timestamps to verify updates

##  Frontend Routes

- `/` - Home page with leaders and recent games
- `/scoreboard` - Daily scoreboard with Uniqorn highlights
- `/ultimate` - Ultimate Uniqorn players and games
- `/api/*` - Backend API routes for data

##  NBA Season Dates

Current season definitions (update as needed):
- 2023-24: Oct 24, 2023 - Apr 14, 2024
- 2024-25: Oct 22, 2024 - Apr 13, 2025
- 2025-26: Oct 21, 2025 - Apr 12, 2026
