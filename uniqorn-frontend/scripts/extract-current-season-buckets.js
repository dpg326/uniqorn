const fs = require('fs');
const path = require('path');

function extractCurrentSeasonBuckets() {
  try {
    // Load the master bucket database
    const masterPath = path.join(process.cwd(), '..', 'master_bucket_database.json');
    console.log('Loading master bucket database from:', masterPath);
    
    const masterContent = fs.readFileSync(masterPath, 'utf-8');
    const masterData = JSON.parse(masterContent);
    
    console.log(`Loaded master database with ${Object.keys(masterData).length} buckets`);
    
    // Create a comprehensive database with all possible combinations
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
    
    // Copy data from master database (this should include current season data)
    let copiedBuckets = 0;
    for (const [bucketKey, bucketData] of Object.entries(masterData)) {
      if (bucketDatabase[bucketKey]) {
        bucketDatabase[bucketKey] = {
          count: bucketData.count,
          games: (bucketData.games || []).slice(0, 10) // Limit to 10 games per bucket
        };
        copiedBuckets++;
      }
    }
    
    console.log(`Copied data for ${copiedBuckets} buckets from master database`);
    
    // Show some bucket counts for debugging
    console.log('Sample bucket counts:');
    console.log(`(0, 0, 0, 0, 0): ${bucketDatabase['(0, 0, 0, 0, 0)'].count} games`);
    console.log(`(1, 0, 0, 0, 0): ${bucketDatabase['(1, 0, 0, 0, 0)'].count} games`);
    console.log(`(0, 1, 0, 0, 0): ${bucketDatabase['(0, 1, 0, 0, 0)'].count} games`);
    console.log(`(3, 2, 1, 0, 0): ${bucketDatabase['(3, 2, 1, 0, 0)'].count} games`);
    
    // Count non-zero buckets
    const nonZeroBuckets = Object.values(bucketDatabase).filter(b => b.count > 0).length;
    console.log(`Total buckets with data: ${nonZeroBuckets}`);
    
    // Write the bucket database
    const outputPath = path.join(process.cwd(), 'public', 'data', 'master_bucket_database.json');
    fs.writeFileSync(outputPath, JSON.stringify(bucketDatabase, null, 2));
    
    // Check file size
    const stats = fs.statSync(outputPath);
    console.log(`Bucket database saved: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
  } catch (error) {
    console.error('Error extracting bucket database:', error);
  }
}

extractCurrentSeasonBuckets();
