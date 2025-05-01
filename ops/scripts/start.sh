#!/bin/sh
set -e  # Exit on error

echo "===== APPLYING CODEMODS ====="
echo "1. Migrating theme config..."
node /app/dist/index.js migrate-theme-config /app/theme.config.jsx

echo "2. Migrating pages to app router..."
node /app/dist/index.js migrate-pages-to-app /app/pages

echo "3. Setting up search..."
node /app/dist/index.js setup-search /app/package.json

echo "4. Migrating MDX components..."
node /app/dist/index.js migrate-mdx-components /app/theme.config.jsx

echo "===== VERIFICATION ====="
echo "Checking generated files:"

# Check for app directory
if [ -d "/app/app" ]; then
  echo "✅ App directory created"
  echo "   Files in app directory:"
  find /app/app -type f | sort
else
  echo "❌ App directory not found"
fi

# Check for mdx-components.jsx
if [ -f "/app/mdx-components.jsx" ]; then
  echo "✅ mdx-components.jsx created"
  echo "   Content preview:"
  head -n 10 /app/mdx-components.jsx
else
  echo "❌ mdx-components.jsx not found"
fi

# Check for Pagefind in package.json
if grep -q "pagefind" /app/package.json; then
  echo "✅ Pagefind added to package.json"
else
  echo "❌ Pagefind not found in package.json"
fi

echo "===== STARTING APP ====="
echo "Codemods applied. Starting Nextra v3 => v4 app..."
npm run dev
