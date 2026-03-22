#!/bin/bash
set -e

echo "================================"
echo "FlowZap Deployment Script"
echo "================================"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run db:generate 2>&1 || echo "⚠️  Prisma generation had issues, continuing..."

# Try to run migrations, but don't fail if they don't work
echo "🔄 Running database migrations..."
if npm run db:migrate 2>&1; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration script failed, but continuing (database may already be migrated)"
fi

# Start the application
echo "🚀 Starting FlowZap API Server..."
npm run start
