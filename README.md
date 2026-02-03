# Uniqorn - NBA Statistical Uniqueness Tracker

A system that tracks statistically unique NBA performances using bucket-based analysis. Identifies "Uniqorn" games - performances that no other player in NBA history has ever matched.

## Architecture

### Core Components

#### Data Pipeline
- **`fast_daily_pipeline.py`** - Main daily pipeline (replaces legacy incremental pipeline)
  - Updates master bucket database with new games
  - Generates all frontend data files
  - Creates charts and leaderboards
  - **Run daily during NBA season**

- **`master_bucket_precompute.py`** - Rebuilds entire master database
  - Processes all historical games since 1973
  - Creates `master_bucket_database.json`
  - **Run once on initial setup or if database is corrupted**

- **`incremental_update.py`** - Updates raw PlayerStatistics.csv from Kaggle
  - Fetches latest game data
  - **Run daily before main pipeline**

#### Utilities
- **`data_utils.py`** - Data loading, cleaning, and bucket creation
- **`master_bucket_utils.py`** - Interface for querying master bucket database
- **`ultimate_uniqorn.py`** - Calculates Ultimate Uniqorn games (all-time)
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
pip install pandas numpy openpyxl plotly kagglehub

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
# 1. Update raw data from Kaggle
python incremental_update.py

# 2. Run main pipeline (generates all frontend data)
python fast_daily_pipeline.py

# 3. Restart frontend to see latest data
# (if running in dev mode)
```

## 📊 Pipeline Flow

```
Kaggle Data → PlayerStatistics.csv
    ↓
incremental_update.py (daily)
    ↓
fast_daily_pipeline.py (daily)
    ├── Updates master_bucket_database.json
    ├── Generates *_Master.xlsx files
    ├── Creates charts in public/*-master/
    └── Updates ultimate_changes_master.json
    ↓
Frontend reads *_Master files
    ↓
Web displays updated data
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
python rebuild_master_complete.py
```

### Season Updates
Update season date ranges in:
- `incremental_update_new.py`
- `master_bucket_precompute.py`
- `generate_seasonal_uniqorn_index.py`

### Archive
Old pipeline files and outputs are stored in `archive/` for reference.

##  Performance

- **Legacy Pipeline**: 10-20 minutes daily
- **Fast Pipeline**: 2-3 minutes daily
- **Master Database**: 2.6M games, 2.6K buckets
- **Update Speed**: 10-100x faster than legacy

##  Troubleshooting

### Common Issues
1. **UnicodeEncodeError** - Fixed in `incremental_update_new.py`
2. **Missing master database** - Run `master_bucket_precompute.py`
3. **Frontend not updating** - Check `*_Master.xlsx` files exist
4. **Chart errors** - Ensure `kaleido` is installed for Plotly

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
