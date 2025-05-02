#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Updates Next.js config for Nextra v4
 */
export function updateNextConfig(
  projectRoot: string = process.cwd(),
): string[] {
  const messages: string[] = [];

  // Check for existing next.config.js or next.config.mjs
  const nextConfigPath = fs.existsSync(path.join(projectRoot, "next.config.js"))
    ? path.join(projectRoot, "next.config.js")
    : fs.existsSync(path.join(projectRoot, "next.config.mjs"))
      ? path.join(projectRoot, "next.config.mjs")
      : path.join(projectRoot, "next.config.js");

  // Create or update Next.js config
  const nextConfig = `const nextra = require('nextra')

const withNextra = nextra({
  // Nextra v4 configuration
  defaultShowCopyCode: true,
  theme: 'nextra-theme-docs'
})

module.exports = withNextra({
  // Other Next.js configurations
  reactStrictMode: true,
})`;

  fs.writeFileSync(nextConfigPath, nextConfig);
  messages.push(`Created/updated ${path.basename(nextConfigPath)}`);

  return messages;
}

// Run the script if called directly
if (require.main === module) {
  console.log("🔧 Fixing Next.js config...");

  const messages = updateNextConfig();

  messages.forEach((message) => {
    console.log(`✅ ${message}`);
  });

  console.log("✅ Next.js config updated successfully!");
}
