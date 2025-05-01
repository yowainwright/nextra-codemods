#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';

const [,, transform, targetPath] = process.argv;

if (!transform || !targetPath) {
  console.error('Usage: npx nextra-codemods <transform> <path>');
  process.exit(1);
}

const availableTransforms: Record<string, string> = {
  'migrate-theme-config': './transforms/migrate-theme-config.js',
  'migrate-pages-to-app': './transforms/migrate-pages-to-app.js',
  'setup-search': './transforms/setup-search.js',
  'migrate-meta-files': './transforms/migrate-meta-files.js',
  'migrate-mdx-components': './transforms/migrate-mdx-components.js',
};

if (!availableTransforms[transform]) {
  console.error(`Transform "${transform}" not found. Available transforms: ${Object.keys(availableTransforms).join(', ')}`);
  process.exit(1);
}

const transformPath = path.resolve(__dirname, availableTransforms[transform]);

try {
  execSync(
    `npx jscodeshift --transform ${transformPath} ${targetPath}`,
    { stdio: 'inherit' }
  );
  console.log(`Successfully applied transform "${transform}" to "${targetPath}"`);
} catch (error) {
  console.error(`Error applying transform "${transform}" to "${targetPath}":`, (error as Error).message);
  process.exit(1);
}