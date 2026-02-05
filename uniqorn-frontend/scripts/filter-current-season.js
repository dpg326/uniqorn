const fs = require('fs');
const path = require('path');

function filterCurrentSeason() {
  try {
    // Load current bucket database
    const currentPath = path.join(process.cwd(), 'public', 'data', 'master_bucket_database.json');
    const content = fs.readFileSync(currentPath, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(`Loaded database with ${Object.keys(data).length} buckets`);
    
    let totalCurrentGames = 0;
    let bucketsWithData = 0;
    
    // Filter each bucket to only include 2025-26 games
    for (const [bucketKey, bucketData] of Object.entries(data)) {
      const currentSeasonGames = (bucketData.games || []).filter(game => {
        // Use the season field to correctly filter games
        // Games from Jan-Apr 2025 are part of 2024-25 season, not 2025-26
        return game.season === '2025-26';
      });
      
      data[bucketKey] = {
        count: currentSeasonGames.length,
        games: currentSeasonGames.slice(0, 10)
      };
      
      if (currentSeasonGames.length > 0) {
        totalCurrentGames += currentSeasonGames.length;
        bucketsWithData++;
      }
    }
    
    console.log(`Current season games: ${totalCurrentGames}`);
    console.log(`Buckets with data: ${bucketsWithData}`);
    console.log(`(0,0,0,0,0): ${data['(0, 0, 0, 0, 0)'].count} games`);
    
    // Write filtered database
    fs.writeFileSync(currentPath, JSON.stringify(data, null, 2));
    console.log('Filtered to current season and saved');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

filterCurrentSeason();
