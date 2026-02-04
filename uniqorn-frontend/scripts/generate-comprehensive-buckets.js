const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Bucket definitions matching the Python script
const points_bins = [0, 5, 10, 15, 20, 25, 30, 40, 50, Infinity];
const assists_bins = [0, 2, 5, 8, 12, 20, Infinity];
const rebounds_bins = [0, 2, 5, 10, 15, 20, Infinity];
const blocks_bins = [0, 1, 3, 5, 7, Infinity];
const steals_bins = [0, 1, 3, 5, 7, Infinity];

// Convert raw stats to bucket indices (matching the exact bucket ranges from Python)
function getBucketIndex(value, bins) {
  if (bins.length === 10) { // Points bins
    if (value >= 0 && value <= 5) return 0;
    else if (value >= 6 && value <= 10) return 1;
    else if (value >= 11 && value <= 15) return 2;
    else if (value >= 16 && value <= 20) return 3;
    else if (value >= 21 && value <= 25) return 4;
    else if (value >= 26 && value <= 30) return 5;
    else if (value >= 31 && value <= 40) return 6;
    else if (value >= 41 && value <= 50) return 7;
    else return 8;
  } else if (bins.length === 7) { // Assists, Rebounds bins
    if (value >= 0 && value <= 2) return 0;
    else if (value >= 3 && value <= 5) return 1;
    else if (value >= 6 && value <= 8) return 2;
    else if (value >= 9 && value <= 12) return 3;
    else if (value >= 13 && value <= 20) return 4;
    else return 5;
  } else if (bins.length === 6) { // Blocks, Steals bins
    if (value >= 0 && value <= 1) return 0;
    else if (value >= 2 && value <= 3) return 1;
    else if (value >= 4 && value <= 5) return 2;
    else if (value >= 6 && value <= 7) return 3;
    else return 4;
  }
  return 0;
}

function generateComprehensiveBucketDatabase() {
  try {
    // Load the current season uniqorn games
    const filePath = path.join(process.cwd(), 'public', 'data', 'CurrentSeason_UniqornGames_Master.xlsx');
    const fileContent = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Loaded ${data.length} games from current season`);
    
    const bucketDatabase = {};
    
    // Create ALL possible bucket combinations (9 * 6 * 6 * 5 * 5 = 8,100 total)
    for (let p = 0; p < 9; p++) { // points bins 0-8
      for (let a = 0; a < 6; a++) { // assists bins 0-5
        for (let r = 0; r < 6; r++) { // rebounds bins 0-5
          for (let b = 0; b < 5; b++) { // blocks bins 0-4
            for (let s = 0; s < 5; s++) { // steals bins 0-4
              const bucket_key = `(${p}, ${a}, ${r}, ${b}, ${s})`;
              bucketDatabase[bucket_key] = {
                count: 0,
                games: []
              };
            }
          }
        }
      }
    }
    
    console.log(`Created ${Object.keys(bucketDatabase).length} possible bucket combinations`);
    
    // Populate with actual game data
    data.forEach(row => {
      const points = parseInt(row.points) || 0;
      const assists = parseInt(row.assists) || 0;
      const rebounds = parseInt(row.reboundsTotal) || parseInt(row.rebounds) || 0;
      const blocks = parseInt(row.blocks) || 0;
      const steals = parseInt(row.steals) || 0;
      
      const points_bin = getBucketIndex(points, points_bins);
      const assists_bin = getBucketIndex(assists, assists_bins);
      const rebounds_bin = getBucketIndex(rebounds, rebounds_bins);
      const blocks_bin = getBucketIndex(blocks, blocks_bins);
      const steals_bin = getBucketIndex(steals, steals_bins);
      
      const bucket_key = `(${points_bin}, ${assists_bin}, ${rebounds_bin}, ${blocks_bin}, ${steals_bin})`;
      
      // Only store first 10 games for each bucket to keep file size reasonable
      if (bucketDatabase[bucket_key].games.length < 10) {
        bucketDatabase[bucket_key].games.push({
          player: `${row.firstName} ${row.lastName}`,
          date: row.game_date || new Date(row.gameDateTimeEst).toLocaleDateString(),
          stats: `${points} PTS / ${assists} AST / ${rebounds} REB / ${blocks} BLK / ${steals} STL`,
          team: row.playerteamName || 'Unknown',
          opponent: row.opponentteamName || 'Unknown'
        });
      }
      
      bucketDatabase[bucket_key].count++;
    });
    
    // Count non-zero buckets
    const nonZeroBuckets = Object.values(bucketDatabase).filter(b => b.count > 0).length;
    console.log(`Populated ${nonZeroBuckets} buckets with actual game data`);
    
    // Write the bucket database
    const outputPath = path.join(process.cwd(), 'public', 'data', 'master_bucket_database.json');
    fs.writeFileSync(outputPath, JSON.stringify(bucketDatabase, null, 2));
    
    // Check file size
    const stats = fs.statSync(outputPath);
    console.log(`Bucket database saved: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
  } catch (error) {
    console.error('Error generating bucket database:', error);
  }
}

generateComprehensiveBucketDatabase();
