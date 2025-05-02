#!/bin/sh
set -e  # Exit on error

echo "===== CHECKING NEXTRA VERSION ====="
# Extract and display Nextra version from package.json
NEXTRA_VERSION=$(grep -o '"nextra": *"[^"]*"' package.json | cut -d'"' -f4)
echo "Current Nextra version: $NEXTRA_VERSION"

echo "===== FIXING POTENTIAL ISSUES ====="
# Run fix scripts to handle common issues
echo "1. Fixing conflicting files..."
tsx /app/src/fixes/fix-conflicts.ts

echo "2. Setting up Tailwind CSS..."
tsx /app/src/fixes/fix-tailwind.ts

echo "===== CREATING APP DIRECTORY ====="
# Create app directory if it doesn't exist
if [ ! -d "/app/app" ]; then
  echo "Creating app directory structure..."
  mkdir -p /app/app
  
  # Create app/layout.tsx
  cat > "/app/app/layout.tsx" << 'EOF'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF
  
  # Create app/page.mdx instead of page.tsx to maintain MDX content
  cat > "/app/app/page.mdx" << 'EOF'
import { Callout } from 'nextra/components'

# Nextra v3 to v4 Migration Demo

This app has been migrated using nextra-codemods!

<Callout type="info">
  Welcome to the home page.
</Callout>

## Features

- App Router Support
- Pagefind Search
- Tailwind CSS Integration
- MDX Components
EOF
  
  # Create app/not-found.tsx
  cat > "/app/app/not-found.tsx" << 'EOF'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">The page you are looking for does not exist.</p>
      <a href="/" className="mt-8 text-blue-500 hover:underline">
        Return to Home
      </a>
    </div>
  )
}
EOF
  
  # Create app/globals.css
  cat > "/app/app/globals.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
EOF
  
  echo "✅ Created app directory structure"
else
  echo "App directory already exists"
fi

echo "===== APPLYING CODEMODS ====="

# 1. Migrating theme config
echo "1. Migrating theme config..."
if [ -f "/app/theme.config.jsx" ]; then
  tsx /app/src/transforms/migrate-theme-config.ts /app/theme.config.jsx
  echo "✅ Migrated theme config"
else
  echo "❌ theme.config.jsx not found"
  
  # Create a more complete theme.config.jsx
  cat > "/app/theme.config.jsx" << 'EOF'
import React from 'react'
import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'

export default {
  logo: <span style={{ fontWeight: 'bold' }}>Nextra v4 Demo</span>,
  project: {
    link: 'https://github.com/shuding/nextra',
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Nextra v4 Demo'
    }
  },
  head: () => {
    const { asPath } = useRouter()
    const { frontMatter } = useConfig()
    return (
      <>
        <meta property="og:title" content={frontMatter.title || 'Nextra v4 Demo'} />
        <meta property="og:description" content={frontMatter.description || 'Nextra: the Next.js site builder'} />
      </>
    )
  },
  editLink: {
    text: 'Edit this page on GitHub'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  sidebar: {
    titleComponent: ({ title, type }) => {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} Nextra v4 Demo.
        </p>
      </div>
    )
  }
}
EOF
  echo "✅ Created complete theme.config.jsx"
fi

# 2. Migrating pages to app router
echo "2. Migrating pages to app router..."
if [ -d "/app/pages.bak" ]; then
  echo "Using backed up pages directory for migration..."
  
  # Copy MDX files from pages.bak to app directory
  find /app/pages.bak -name "*.mdx" | while read mdx_file; do
    # Get the relative path without the extension
    rel_path=$(echo "$mdx_file" | sed 's|/app/pages.bak/||' | sed 's|\.mdx$||')
    
    # Handle index.mdx specially
    if [ "$rel_path" = "index" ]; then
      # We already created the root page.mdx
      continue
    fi
    
    # Create the directory in app
    mkdir -p "/app/app/$rel_path"
    
    # Copy the content to page.mdx
    cat "$mdx_file" > "/app/app/$rel_path/page.mdx"
    
    echo "Copied $mdx_file to /app/app/$rel_path/page.mdx"
  done
  
  echo "✅ Migrated pages to app router"
else
  echo "❌ pages.bak directory not found for migration"
fi

# 3. Setting up search
echo "3. Setting up search..."
# Add pagefind to package.json
if ! grep -q "pagefind" /app/package.json; then
  sed -i '/"dependencies": {/a\    "pagefind": "^1.0.0",' /app/package.json
fi

# Add postbuild script
if grep -q '"scripts": {' /app/package.json; then
  if ! grep -q '"postbuild"' /app/package.json; then
    sed -i '/"scripts": {/a\    "postbuild": "pagefind --source .next/server/app",' /app/package.json
  fi
else
  sed -i '/"dependencies": {/i\  "scripts": {\n    "postbuild": "pagefind --source .next/server/app",\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },' /app/package.json
fi

# Update .gitignore for Pagefind
if [ -f "/app/.gitignore" ]; then
  if ! grep -q "_pagefind" /app/.gitignore; then
    echo -e "\n# Pagefind search index\n_pagefind/" >> /app/.gitignore
  fi
else
  echo "# Pagefind search index\n_pagefind/" > /app/.gitignore
fi

echo "✅ Set up search"

# 4. Migrating MDX components
echo "4. Migrating MDX components..."
# Create mdx-components.tsx
cat > "/app/mdx-components.tsx" << 'EOF'
import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getDocsMDXComponents } from 'nextra/mdx-components'
import Image from 'next/image'
import { Callout } from 'nextra/components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components,
    // Override components as needed
    img: (props) => (
      <Image 
        {...props} 
        alt={props.alt || ''} 
        width={props.width || 800} 
        height={props.height || 450} 
      />
    ),
    Callout,
  }
}
EOF
echo "✅ Migrated MDX components"

# 5. Updating Next.js config
echo "5. Updating Next.js config..."
if [ -f "/app/next.config.mjs" ]; then
  # Create backup of the original file
  cp /app/next.config.mjs /app/next.config.mjs.bak
  
  # Create new config content for Nextra v4
  cat > "/app/next.config.mjs" << 'EOF'
import nextra from 'nextra'

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true
})

export default withNextra({
  // Other Next.js configurations
})
EOF
  
  echo "✅ Updated Next.js config"
elif [ -f "/app/next.config.js" ]; then
  cp /app/next.config.js /app/next.config.js.bak
  
  cat > "/app/next.config.js" << 'EOF'
const nextra = require('nextra')

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true
})

module.exports = withNextra({
  // Other Next.js configurations
})
EOF
  
  echo "✅ Updated Next.js config"
else
  cat > "/app/next.config.js" << 'EOF'
const nextra = require('nextra')

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true
})

module.exports = withNextra({
  // Other Next.js configurations
})
EOF
  
  echo "✅ Created Next.js config"
fi

if [ ! -f "/app/tsconfig.json" ]; then
  echo "Creating tsconfig.json..."
  cat > "/app/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
  echo "✅ Created tsconfig.json"
fi

echo "===== VERIFICATION ====="
echo "Checking generated files:"

if [ -d "/app/app" ]; then
  echo "✅ App directory created"
  echo "   Files in app directory:"
  find /app/app -type f | sort
else
  echo "❌ App directory not found"
fi

if [ -f "/app/mdx-components.tsx" ]; then
  echo "✅ mdx-components.tsx created"
  echo "   Content preview:"
  head -n 10 /app/mdx-components.tsx
else
  echo "❌ mdx-components.tsx not found"
fi

if grep -q "pagefind" /app/package.json; then
  echo "✅ Pagefind added to package.json"
else
  echo "❌ Pagefind not found in package.json"
fi

if [ -f "/app/next.config.mjs.bak" ] || [ -f "/app/next.config.js.bak" ]; then
  echo "✅ Next.js config updated (backup created)"
else
  echo "❓ Next.js config status unknown"
fi

if [ -f "/app/tailwind.config.js" ]; then
  echo "✅ Tailwind CSS configuration found"
else
  echo "❌ Tailwind CSS configuration not found"
fi

echo "===== CHECKING UPDATED NEXTRA VERSION ====="
sed -i 's/"nextra": *"[^"]*"/"nextra": "^4.0.0"/' /app/package.json
sed -i 's/"nextra-theme-docs": *"[^"]*"/"nextra-theme-docs": "^4.0.0"/' /app/package.json

if [ -d "/app/patches" ]; then
  echo "Removing patches directory to avoid conflicts..."
  rm -rf /app/patches
  echo "✅ Removed patches directory"
fi

pnpm install

UPDATED_NEXTRA_VERSION=$(grep -o '"nextra": *"[^"]*"' package.json | cut -d'"' -f4)
echo "Updated Nextra version: $UPDATED_NEXTRA_VERSION"

echo "===== STARTING APP ====="
echo "Codemods applied. Starting Nextra v3 => v4 app..."
pnpm run dev

cat > "/app/app/_meta.js" << 'EOF'
export default {
  index: {
    title: 'Home',
    display: 'hidden',
    theme: {
      layout: 'full'
    }
  },
  docs: {
    title: 'Documentation'
  },
  examples: {
    title: 'Examples'
  },
  '*': {
    theme: {
      breadcrumb: true,
      footer: true,
      sidebar: true,
      toc: true,
      pagination: true
    }
  }
}
EOF

mkdir -p "/app/app/docs"
cat > "/app/app/docs/page.mdx" << 'EOF'
# Documentation

Welcome to the documentation section.

## Getting Started

This is a basic documentation page created during the migration from Nextra v3 to v4.

## Features

- **App Router Support**: Nextra v4 fully supports Next.js App Router
- **Pagefind Search**: Fast and efficient search functionality
- **MDX Components**: Use React components in your markdown
EOF

mkdir -p "/app/app/examples"
cat > "/app/app/examples/page.mdx" << 'EOF'
# Examples

Here are some examples of what you can do with Nextra v4.

## Code Blocks

```js
function hello() {
  console.log('Hello, world!');
}
```

## Callouts

import { Callout } from 'nextra/components'

<Callout type="info">
  This is an informational callout.
</Callout>

<Callout type="warning">
  This is a warning callout.
</Callout>

<Callout type="error">
  This is an error callout.
</Callout>
EOF

echo "Running fix-next-config script..."
tsx /app/src/fixes/fix-next-config.ts

echo "Running fix-tailwind script..."
tsx /app/src/fixes/fix-tailwind.ts

echo "Installing Tailwind CSS dependencies..."
pnpm install -D tailwindcss postcss autoprefixer

if [ ! -f "/app/theme.config.jsx" ]; then
  echo "Creating theme.config.jsx..."
  cat > "/app/theme.config.jsx" << 'EOF'
export default {
  logo: <span style={{ fontWeight: 'bold' }}>Nextra v4 Demo</span>,
  project: {
    link: 'https://github.com/shuding/nextra',
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Nextra v4 Demo'
    }
  },
  footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} Nextra v4 Demo.
        </p>
      </div>
    )
  }
}
EOF
fi

if [ ! -f "/app/mdx-components.tsx" ]; then
  echo "Creating mdx-components.tsx..."
  cat > "/app/mdx-components.tsx" << 'EOF'
import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getDocsMDXComponents } from 'nextra/mdx-components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...getDocsMDXComponents(),
    ...components,
  }
}
EOF
fi

echo "Setting up Code Hike..."
tsx /app/src/fixes/fix-code-hike.ts

if [ -f "/app/tsup.config.ts" ]; then
  sed -i '/src\/fixes\/fix-nextra.ts/a\    '\''src/fixes/fix-code-hike.ts'\'',/' /app/tsup.config.ts
fi

if [ -f "/app/src/index.ts" ]; then
  sed -i '/'\''fix-nextra'\'': '\''\.\/fixes\/fix-nextra\.ts'\'',/a\  '\''fix-code-hike'\'': '\''\.\/fixes\/fix-code-hike\.ts'\'',/' /app/src/index.ts
fi

echo "Rebuilding the project..."
pnpm run build

echo "Restarting the application..."
pnpm run dev
