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

function generateFullSeasonBucketDatabase() {
  try {
    // Try to load the full season data from PlayerStatistics.csv
    const filePath = path.join(process.cwd(), '..', 'PlayerStatistics.csv');
    console.log('Looking for PlayerStatistics.csv at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('PlayerStatistics.csv not found');
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log(`Found ${lines.length - 1} games in PlayerStatistics.csv`);
    
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
    
    // Find column indices
    const pointsIdx = headers.findIndex(h => h.includes('points'));
    const assistsIdx = headers.findIndex(h => h.includes('assists'));
    const reboundsIdx = headers.findIndex(h => h.includes('rebounds'));
    const blocksIdx = headers.findIndex(h => h.includes('blocks'));
    const stealsIdx = headers.findIndex(h => h.includes('steals'));
    const firstNameIdx = headers.findIndex(h => h.includes('firstName'));
    const lastNameIdx = headers.findIndex(h => h.includes('lastName'));
    const dateIdx = headers.findIndex(h => h.includes('gameDateTimeEst'));
    const teamIdx = headers.findIndex(h => h.includes('playerteamName'));
    const opponentIdx = headers.findIndex(h => h.includes('opponentteamName'));
    
    console.log('Column indices:', { pointsIdx, assistsIdx, reboundsIdx, blocksIdx, stealsIdx });
    
    // Populate with actual game data
    let processedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 5) continue; // Skip incomplete rows
      
      const points = parseInt(values[pointsIdx]) || 0;
      const assists = parseInt(values[assistsIdx]) || 0;
      const rebounds = parseInt(values[reboundsIdx]) || 0;
      const blocks = parseInt(values[blocksIdx]) || 0;
      const steals = parseInt(values[stealsIdx]) || 0;
      
      const points_bin = getBucketIndex(points, points_bins);
      const assists_bin = getBucketIndex(assists, assists_bins);
      const rebounds_bin = getBucketIndex(rebounds, rebounds_bins);
      const blocks_bin = getBucketIndex(blocks, blocks_bins);
      const steals_bin = getBucketIndex(steals, steals_bins);
      
      const bucket_key = `(${points_bin}, ${assists_bin}, ${rebounds_bin}, ${blocks_bin}, ${steals_bin})`;
      
      // Only store first 10 games for each bucket to keep file size reasonable
      if (bucketDatabase[bucket_key].games.length < 10) {
        bucketDatabase[bucket_key].games.push({
          player: `${values[firstNameIdx]} ${values[lastNameIdx]}`,
          date: values[dateIdx] ? new Date(values[dateIdx]).toLocaleDateString() : 'Unknown',
          stats: `${points} PTS / ${assists} AST / ${rebounds} REB / ${blocks} BLK / ${steals} STL`,
          team: values[teamIdx] || 'Unknown',
          opponent: values[opponentIdx] || 'Unknown'
        });
      }
      
      bucketDatabase[bucket_key].count++;
      processedCount++;
      
      // Debug: Show first few buckets
      if (processedCount <= 10) {
        console.log(`Game ${processedCount}: ${points}-${assists}-${rebounds}-${blocks}-${steals} -> bucket ${bucket_key}`);
      }
    }
    
    // Count non-zero buckets
    const nonZeroBuckets = Object.values(bucketDatabase).filter(b => b.count > 0).length;
    console.log(`Processed ${processedCount} total games`);
    console.log(`Populated ${nonZeroBuckets} buckets with actual game data`);
    
    // Show some bucket counts for debugging
    console.log('Sample bucket counts:');
    console.log(`(0, 0, 0, 0, 0): ${bucketDatabase['(0, 0, 0, 0, 0)'].count} games`);
    console.log(`(1, 0, 0, 0, 0): ${bucketDatabase['(1, 0, 0, 0, 0)'].count} games`);
    console.log(`(0, 1, 0, 0, 0): ${bucketDatabase['(0, 1, 0, 0, 0)'].count} games`);
    console.log(`(3, 2, 1, 0, 0): ${bucketDatabase['(3, 2, 1, 0, 0)'].count} games`);
    
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

generateFullSeasonBucketDatabase();
