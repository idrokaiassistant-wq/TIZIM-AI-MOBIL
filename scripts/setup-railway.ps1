# Railway Service Setup Script
# Bu script Railway service'larni avtomatik sozlaydi

Write-Host "🚀 Railway Service Setup" -ForegroundColor Green
Write-Host ""

# Check Railway CLI
Write-Host "📦 Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Railway CLI: $railwayVersion" -ForegroundColor Green
Write-Host ""

# Check if linked
Write-Host "🔗 Checking Railway project link..." -ForegroundColor Yellow
railway status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not linked to Railway project" -ForegroundColor Yellow
    Write-Host "   Please run: railway link" -ForegroundColor Cyan
    Write-Host "   Or: railway link -p <project-id>" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Linked to Railway project" -ForegroundColor Green
Write-Host ""

# Frontend Service Setup
Write-Host "🎨 Setting up Frontend Service..." -ForegroundColor Yellow
Write-Host "   Service: app"
Write-Host "   Build Command: npm ci --legacy-peer-deps && npm run build"
Write-Host "   Start Command: npx serve -s dist -l `$PORT"
Write-Host ""
Write-Host "   Environment Variables:"
Write-Host "   - VITE_API_URL=https://backend-production-219b.up.railway.app"
Write-Host ""

# n8n Service Setup
Write-Host "⚙️  Setting up n8n Service..." -ForegroundColor Yellow
Write-Host "   Service: n8n"
Write-Host "   Root Directory: n8n"
Write-Host "   Build Command: pnpm install"
Write-Host "   Start Command: pnpm start"
Write-Host ""
Write-Host "   Required Environment Variables:"
Write-Host "   - BACKEND_API_URL=https://backend-production-219b.up.railway.app"
Write-Host "   - N8N_BASIC_AUTH_ACTIVE=true"
Write-Host "   - N8N_BASIC_AUTH_USER=admin"
Write-Host "   - N8N_BASIC_AUTH_PASSWORD=<your-password>"
Write-Host ""

Write-Host "📝 Manual Steps Required:" -ForegroundColor Cyan
Write-Host "   1. Railway Dashboard'ga kiring: https://railway.app/dashboard"
Write-Host "   2. Frontend service (app) sozlamalari:"
Write-Host "      - Settings → Deploy → Build Command: npm ci --legacy-peer-deps && npm run build"
Write-Host "      - Settings → Deploy → Start Command: npx serve -s dist -l `$PORT"
Write-Host "      - Variables → VITE_API_URL qo'shing"
Write-Host ""
Write-Host "   3. n8n service yaratish:"
Write-Host "      - New → GitHub Repo → Repository tanlang"
Write-Host "      - Root Directory: n8n"
Write-Host "      - Environment variables qo'shing (yuqorida ko'rsatilgan)"
Write-Host ""
Write-Host "   4. Backend CORS sozlash:"
Write-Host "      - Backend service → Variables → CORS_ORIGINS"
Write-Host "      - Frontend URL qo'shing"
Write-Host ""

Write-Host "✅ Setup instructions ready!" -ForegroundColor Green

