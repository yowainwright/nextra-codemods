#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Sets up Tailwind CSS and related styling for Nextra v4
 */
export function setupTailwindCSS(
  projectRoot: string = process.cwd(),
): string[] {
  const messages: string[] = [];

  // 1. Create tailwind.config.js
  const tailwindConfigPath = path.join(projectRoot, "tailwind.config.js");
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,md,mdx}',
    './pages/**/*.{js,jsx,ts,tsx,md,mdx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './theme.config.jsx',
    './mdx-components.tsx'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
  messages.push("Created tailwind.config.js");

  // 2. Create postcss.config.js
  const postcssConfigPath = path.join(projectRoot, "postcss.config.js");
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  fs.writeFileSync(postcssConfigPath, postcssConfig);
  messages.push("Created postcss.config.js");

  // 3. Create or update globals.css
  const appDir = path.join(projectRoot, "app");
  if (fs.existsSync(appDir)) {
    const globalsCssPath = path.join(appDir, "globals.css");
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Additional global styles */
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
}`;

    fs.writeFileSync(globalsCssPath, globalsCss);
    messages.push("Created/updated app/globals.css");
  }

  // 4. Update package.json with Tailwind dependencies
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }

      let updated = false;

      if (!packageJson.devDependencies.tailwindcss) {
        packageJson.devDependencies.tailwindcss = "^3.3.0";
        updated = true;
      }

      if (!packageJson.devDependencies.postcss) {
        packageJson.devDependencies.postcss = "^8.4.31";
        updated = true;
      }

      if (!packageJson.devDependencies.autoprefixer) {
        packageJson.devDependencies.autoprefixer = "^10.4.16";
        updated = true;
      }

      if (updated) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        messages.push("Updated package.json with Tailwind CSS dependencies");
      }
    }
  } catch (error) {
    messages.push(`Error updating package.json: ${(error as Error).message}`);
  }

  return messages;
}

// Run the script if called directly
if (require.main === module) {
  console.log("🔧 Fixing all styling issues...");

  const messages = setupTailwindCSS();

  messages.forEach((message) => {
    console.log(`✅ ${message}`);
  });

  console.log("✅ All styling fixes applied successfully!");
}
