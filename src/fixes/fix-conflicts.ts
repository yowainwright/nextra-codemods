#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Paths
const pagesDir = path.join(process.cwd(), "pages");
const backupDir = path.join(process.cwd(), "pages.bak");
const appDir = path.join(process.cwd(), "app");

// Check if pages directory exists
if (fs.existsSync(pagesDir)) {
  console.log("Creating backup of pages directory...");

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Copy all files from pages to backup
  copyDirectory(pagesDir, backupDir);
  console.log(`Pages directory backed up to ${backupDir}`);

  // Remove the original pages directory
  fs.rmSync(pagesDir, { recursive: true });
  console.log("Removed pages directory to resolve conflicts");

  // Create app directory if it doesn't exist
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
    console.log("Created app directory");

    // Create a basic page.tsx file
    const pageFilePath = path.join(appDir, "page.tsx");
    const pageContent = `
export default function Home() {
  return (
    <div>
      <h1>Nextra v3 to v4 Migration Demo</h1>
      <p>This app has been migrated using nextra-codemods!</p>
    </div>
  )
}
`;
    fs.writeFileSync(pageFilePath, pageContent);
    console.log("Created app/page.tsx");

    // Create a basic layout.tsx file
    const layoutFilePath = path.join(appDir, "layout.tsx");
    const layoutContent = `
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
    fs.writeFileSync(layoutFilePath, layoutContent);
    console.log("Created app/layout.tsx");

    // Create a basic globals.css file
    const globalsCssPath = path.join(appDir, "globals.css");
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;
    fs.writeFileSync(globalsCssPath, globalsCss);
    console.log("Created app/globals.css");
  }
}

// Helper function to copy a directory recursively
function copyDirectory(source: string, destination: string): void {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  // Copy each entry to the destination
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

console.log("Conflicts resolved. You can now restart your development server.");
