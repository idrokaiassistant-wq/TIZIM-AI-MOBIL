# Avtomatik Railway Service Setup Script
# Bu script barcha service'larni avtomatik sozlaydi

Write-Host "🚀 Railway Avtomatik Setup" -ForegroundColor Green
Write-Host ""

# Check Railway CLI
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI topilmadi!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Railway CLI: $railwayVersion" -ForegroundColor Green
Write-Host ""

# Frontend Service Setup
Write-Host "🎨 Frontend Service Sozlash..." -ForegroundColor Yellow
railway service app 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend service topildi" -ForegroundColor Green
    
    # VITE_API_URL qo'shish
    railway variables --set "VITE_API_URL=https://backend-production-219b.up.railway.app" 2>&1 | Out-Null
    Write-Host "✅ VITE_API_URL qo'shildi" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend service topilmadi" -ForegroundColor Yellow
}
Write-Host ""

# Backend Service Setup
Write-Host "🔧 Backend Service Sozlash..." -ForegroundColor Yellow
railway service backend 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend service topildi" -ForegroundColor Green
    
    # CORS_ORIGINS qo'shish
    railway variables --set "CORS_ORIGINS=https://app-production-e8ad.up.railway.app,https://web.telegram.org" 2>&1 | Out-Null
    Write-Host "✅ CORS_ORIGINS yangilandi" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend service topilmadi" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📝 Qo'shimcha Qadamlar:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Frontend Service (Railway Dashboard):" -ForegroundColor Yellow
Write-Host "   - Settings → Deploy → Build Command:" -ForegroundColor White
Write-Host "     npm ci --legacy-peer-deps && npm run build" -ForegroundColor Gray
Write-Host "   - Settings → Deploy → Start Command:" -ForegroundColor White
Write-Host "     npx serve -s dist -l `$PORT" -ForegroundColor Gray
Write-Host ""
Write-Host "2. n8n Service Yaratish (Railway Dashboard):" -ForegroundColor Yellow
Write-Host "   - New → GitHub Repo → Repository tanlang" -ForegroundColor White
Write-Host "   - Root Directory: n8n" -ForegroundColor Gray
Write-Host "   - Build Command: pnpm install" -ForegroundColor Gray
Write-Host "   - Start Command: pnpm start" -ForegroundColor Gray
Write-Host "   - Environment Variables qo'shing" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Sozlamalar tayyor!" -ForegroundColor Green

