/**
 * Sets up the new Pagefind search engine
 */

const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Get the directory of the file being processed
  const filePath = fileInfo.path;
  const projectRoot = options.projectRoot || process.cwd();
  
  // Check if package.json exists
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('package.json not found, skipping');
    return fileInfo.source;
  }
  
  // Read package.json
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    console.error('Error reading package.json:', error);
    return fileInfo.source;
  }
  
  // Add pagefind as a dev dependency
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  packageJson.devDependencies.pagefind = "^1.0.0";
  
  // Add postbuild script
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  // Check if the project uses static exports
  const nextConfigPath = path.join(projectRoot, 'next.config.js');
  let isStaticExport = false;
  
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    isStaticExport = nextConfigContent.includes('output: "export"') || 
                     nextConfigContent.includes('output: \'export\'');
  }
  
  // Set the appropriate postbuild script
  if (isStaticExport) {
    packageJson.scripts.postbuild = "pagefind --site .next/server/app --output-path out/_pagefind";
  } else {
    packageJson.scripts.postbuild = "pagefind --site .next/server/app --output-path public/_pagefind";
  }
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('Added pagefind as a dev dependency and configured postbuild script');
  
  // Update .gitignore to ignore _pagefind directory
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('_pagefind')) {
      gitignoreContent += '\n# Pagefind search index\n_pagefind/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('Updated .gitignore to ignore _pagefind directory');
    }
  }
  
  // Check if using pnpm and create .npmrc if needed
  const pnpmLockPath = path.join(projectRoot, 'pnpm-lock.yaml');
  if (fs.existsSync(pnpmLockPath)) {
    const npmrcPath = path.join(projectRoot, '.npmrc');
    let npmrcContent = '';
    
    if (fs.existsSync(npmrcPath)) {
      npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
    }
    
    if (!npmrcContent.includes('enable-pre-post-scripts')) {
      npmrcContent += '\nenable-pre-post-scripts=true\n';
      fs.writeFileSync(npmrcPath, npmrcContent);
      console.log('Created/updated .npmrc to enable pre/post scripts for pnpm');
    }
  }
  
  // Return the original source (we're not modifying the input file)
  return fileInfo.source;
};
