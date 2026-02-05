# Daily Uniqorn Data Update Script
# Run this script daily to update all data and deploy to Vercel

Write-Host "🚀 Starting Daily Uniqorn Update Pipeline" -ForegroundColor Cyan
Write-Host "⏰ Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Activate conda environment
Write-Host "🐍 Activating conda environment..." -ForegroundColor Yellow
conda activate cityshape
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to activate conda environment!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Conda environment activated" -ForegroundColor Green
Write-Host ""

# Step 1: Run Fast Daily Pipeline
Write-Host "📊 Step 1/5: Running fast daily pipeline..." -ForegroundColor Yellow
python fast_daily_pipeline.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fast daily pipeline failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fast daily pipeline completed" -ForegroundColor Green
Write-Host ""

# Step 2: Run Incremental Update
Write-Host "📈 Step 2/5: Running incremental update..." -ForegroundColor Yellow
python incremental_update_new.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Incremental update failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Incremental update completed" -ForegroundColor Green
Write-Host ""

# Step 3: Copy Excel files to frontend
Write-Host "📁 Step 3/5: Copying Excel files to frontend..." -ForegroundColor Yellow
Copy-Item -Path "*.xlsx" -Destination "uniqorn-frontend\public\data\" -Force
Write-Host "✅ Excel files copied" -ForegroundColor Green
Write-Host ""

# Step 4: Update bucket database
Write-Host "🪣 Step 4/5: Updating bucket database..." -ForegroundColor Yellow
Set-Location "uniqorn-frontend"
node scripts/filter-current-season.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Bucket database update failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Bucket database updated" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "🚀 Step 5/5: Deploying to Vercel..." -ForegroundColor Yellow
git add .
$commitMessage = "Daily data update - $(Get-Date -Format 'yyyy-MM-dd')"
git commit -m $commitMessage
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployed to Vercel" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Daily update completed successfully!" -ForegroundColor Cyan
Write-Host "⏰ Finished at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Wait 2-3 minutes for Vercel deployment" -ForegroundColor White
Write-Host "   2. Check your hosted site for updated data" -ForegroundColor White
Write-Host "   3. Verify: home page, /search, and charts" -ForegroundColor White
