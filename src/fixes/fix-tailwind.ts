#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Sets up Tailwind CSS for Nextra v4
 */
export function setupTailwind(projectRoot: string = process.cwd()): string[] {
  const messages: string[] = [];

  // Create tailwind.config.js
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

  // Create postcss.config.js
  const postcssConfigPath = path.join(projectRoot, "postcss.config.js");
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  fs.writeFileSync(postcssConfigPath, postcssConfig);
  messages.push("Created postcss.config.js");

  return messages;
}

// Run the script if called directly
if (require.main === module) {
  console.log("🔧 Setting up Tailwind CSS...");

  const messages = setupTailwind();

  messages.forEach((message) => {
    console.log(`✅ ${message}`);
  });

  console.log("✅ Tailwind CSS setup completed!");
}
