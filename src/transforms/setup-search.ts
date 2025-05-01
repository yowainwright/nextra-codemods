import { FileInfo, API, Options } from 'jscodeshift';
import fs from 'fs';
import path from 'path';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
): string {
  const projectRoot = options.projectRoot || process.cwd();
  
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return file.source;
  }
  
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    return file.source;
  }
  
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  packageJson.devDependencies.pagefind = "^1.0.0";
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  const nextConfigPath = path.join(projectRoot, 'next.config.js');
  let isStaticExport = false;
  
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    isStaticExport = nextConfigContent.includes('output: "export"') || 
                     nextConfigContent.includes('output: \'export\'');
  }
  
  if (isStaticExport) {
    packageJson.scripts.postbuild = "pagefind --source out";
  } else {
    packageJson.scripts.postbuild = "pagefind --source .next/server/app";
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('_pagefind')) {
      gitignoreContent += '\n# Pagefind search index\n_pagefind/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }
  }
  
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
    }
  }
  
  return file.source;
}