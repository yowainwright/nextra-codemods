import { FileInfo, API, Options } from "jscodeshift";
import fs from "fs";
import path from "path";

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options,
): string {
  const filePath = file.path;
  const isEsm = filePath.endsWith(".mjs");

  // Create backup of the original file
  const backupPath = `${filePath}.bak`;
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  } catch (error) {
    console.error(`Failed to create backup: ${(error as Error).message}`);
  }

  // Create new config content for Nextra v4 (without theme, themeConfig, or flexsearch)
  const newConfigContent = isEsm
    ? `import nextra from 'nextra'

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true
})

export default withNextra({
  // Other Next.js configurations
})
`
    : `const nextra = require('nextra')

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true
})

module.exports = withNextra({
  // Other Next.js configurations
})
`;

  // Write the new config file
  try {
    fs.writeFileSync(filePath, newConfigContent);
    console.log(`Updated Next.js config at ${filePath}`);
  } catch (error) {
    console.error(`Failed to write new config: ${(error as Error).message}`);
  }

  return file.source;
}
