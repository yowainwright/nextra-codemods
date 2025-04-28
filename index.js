#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

// Get the transform name and path from command line arguments
const [,, transform, targetPath] = process.argv;

if (!transform || !targetPath) {
  console.error('Usage: npx nextra-codemods <transform> <path>');
  process.exit(1);
}

// Map of available transforms
const availableTransforms = {
  'migrate-theme-config': './src/transforms/migrate-theme-config.js',
  'migrate-pages-to-app': './src/transforms/migrate-pages-to-app.js',
  'setup-search': './src/transforms/setup-search.js',
  'migrate-meta-files': './src/transforms/migrate-meta-files.js',
  'migrate-mdx-components': './src/transforms/migrate-mdx-components.js',
};

// Check if the transform exists
if (!availableTransforms[transform]) {
  console.error(`Transform "${transform}" not found. Available transforms: ${Object.keys(availableTransforms).join(', ')}`);
  process.exit(1);
}

// Get the absolute path to the transform
const transformPath = path.resolve(__dirname, availableTransforms[transform]);

try {
  // Run jscodeshift with the transform
  const result = execSync(
    `npx jscodeshift --transform ${transformPath} ${targetPath}`,
    { stdio: 'inherit' }
  );
  
  console.log(`Successfully applied transform "${transform}" to "${targetPath}"`);
} catch (error) {
  console.error(`Error applying transform "${transform}" to "${targetPath}":`, error.message);
  process.exit(1);
}
