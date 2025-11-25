#!/bin/bash
set -e  # Exit on error

echo "🔄 Running database migrations..."
npx sequelize-cli db:migrate

echo "✅ Migrations completed"

echo "📦 Building application..."
npm run build

echo "✅ Build completed"