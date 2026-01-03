#!/bin/bash
# Railway Service Setup Script
# Bu script Railway service'larni avtomatik sozlaydi

echo "🚀 Railway Service Setup"
echo ""

# Check Railway CLI
echo "📦 Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi
echo "✅ Railway CLI: $(railway --version)"
echo ""

# Check if linked
echo "🔗 Checking Railway project link..."
if ! railway status &> /dev/null; then
    echo "⚠️  Not linked to Railway project"
    echo "   Please run: railway link"
    echo "   Or: railway link -p <project-id>"
    exit 1
fi
echo "✅ Linked to Railway project"
echo ""

echo "📝 Manual Steps Required:"
echo "   1. Railway Dashboard'ga kiring: https://railway.app/dashboard"
echo "   2. Frontend service sozlamalari:"
echo "      - Settings → Deploy → Build Command: npm ci --legacy-peer-deps && npm run build"
echo "      - Settings → Deploy → Start Command: npx serve -s dist -l \$PORT"
echo "      - Variables → VITE_API_URL qo'shing"
echo ""
echo "   3. n8n service yaratish:"
echo "      - New → GitHub Repo → Repository tanlang"
echo "      - Root Directory: n8n"
echo "      - Environment variables qo'shing"
echo ""

echo "✅ Setup instructions ready!"

