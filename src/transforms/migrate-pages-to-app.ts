import { FileInfo, API, Options } from "jscodeshift";
import fs from "fs";
import path from "path";

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options,
): string {
  const projectRoot = options.projectRoot || process.cwd();
  const pagesDir = path.join(projectRoot, "pages");
  const appDir = path.join(projectRoot, "app");

  // Skip if pages directory doesn't exist
  if (!fs.existsSync(pagesDir)) {
    console.log("Pages directory not found. Skipping migration.");
    return file.source;
  }

  // Check if app directory already exists
  const appDirExists = fs.existsSync(appDir);

  // Handle auto-rename option
  if (options.autoRename) {
    console.log(
      "\x1b[33mAuto-rename option detected. Handling pages directory...\x1b[0m",
    );

    // Create backup of pages directory
    const backupDir = path.join(projectRoot, "pages.bak");
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }

    // Copy pages to backup
    copyDirectory(pagesDir, backupDir);
    console.log(`Pages directory backed up to ${backupDir}`);

    // Remove original pages directory to avoid conflicts
    fs.rmSync(pagesDir, { recursive: true, force: true });
    console.log(`Removed original pages directory to avoid conflicts`);
  }

  // Create app directory if it doesn't exist
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  // Create globals.css for Tailwind
  const globalsCssPath = path.join(appDir, "globals.css");
  const globalsCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  fs.writeFileSync(globalsCssPath, globalsCssContent);
  console.log(`Created globals.css at ${globalsCssPath}`);

  // Create tailwind.config.js if it doesn't exist
  const tailwindConfigPath = path.join(projectRoot, "tailwind.config.js");
  if (!fs.existsSync(tailwindConfigPath)) {
    const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,md,mdx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './theme.config.jsx',
    './mdx-components.jsx'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    fs.writeFileSync(tailwindConfigPath, tailwindConfigContent);
    console.log(`Created tailwind.config.js at ${tailwindConfigPath}`);
  }

  // Create app/layout.jsx
  const layoutPath = path.join(appDir, "layout.jsx");
  const layoutContent = `import { DocsLayout } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'
import './globals.css'

export default function Layout({ children }) {
  return (
    <DocsLayout>
      <title>Nextra v3 to v4 Migration Demo</title>
      {children}
    </DocsLayout>
  );
}`;
  fs.writeFileSync(layoutPath, layoutContent);
  console.log(`Created layout.jsx at ${layoutPath}`);

  // Create _meta.js in app directory
  const metaPath = path.join(appDir, "_meta.js");
  const metaContent = `export default {
  index: {
    title: 'Home'
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
}`;
  fs.writeFileSync(metaPath, metaContent);
  console.log(`Created _meta.js at ${metaPath}`);

  // If we've auto-renamed, use the backup directory to migrate files
  const sourceDir = options.autoRename
    ? path.join(projectRoot, "pages.bak")
    : pagesDir;

  // Find all MDX files in the source directory
  const mdxFiles = findMdxFiles(sourceDir);

  // Migrate each MDX file to the app directory
  mdxFiles.forEach((mdxFile) => {
    const relativePath = path.relative(sourceDir, mdxFile);
    const fileName = path.basename(relativePath);
    const dirName = path.dirname(relativePath);

    // Determine the target directory in the app folder
    let targetDir;
    if (fileName === "index.mdx") {
      targetDir = path.join(appDir, dirName);
    } else {
      targetDir = path.join(appDir, dirName, fileName.replace(/\.mdx$/, ""));
    }

    // Create the target directory
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Create the page.mdx file
    const targetPath = path.join(targetDir, "page.mdx");
    const content = fs.readFileSync(mdxFile, "utf8");
    fs.writeFileSync(targetPath, content);

    console.log(`Migrated ${mdxFile} to ${targetPath}`);
  });

  // After migration, provide guidance
  console.log("\n\x1b[32mMigration completed!\x1b[0m");

  if (!options.autoRename) {
    console.log(
      "\n\x1b[31mIMPORTANT: You must remove or rename the pages directory to avoid conflicts!\x1b[0m",
    );
    console.log("Run one of these commands:");
    console.log("  rm -rf pages  # Remove pages directory completely");
    console.log("  mv pages pages.bak  # Rename pages directory");
    console.log("\nOr run the migration again with the --auto-rename option:");
    console.log(
      "  npx nextra-codemods migrate-pages-to-app ./pages --auto-rename",
    );
  } else {
    console.log(
      "\x1b[33mThe pages directory has been renamed to pages.bak\x1b[0m",
    );
    console.log("Your app is now using the App Router exclusively.");
  }

  // Check if tailwindcss is installed
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const hasTailwind =
      packageJson.dependencies?.tailwindcss ||
      packageJson.devDependencies?.tailwindcss;

    if (!hasTailwind) {
      console.log(
        "\n\x1b[33mWARNING: tailwindcss is required for Nextra v4 but not found in dependencies.\x1b[0m",
      );
      console.log("Run the following command to install it:");
      console.log("  npm install -D tailwindcss postcss autoprefixer");
      console.log("  npx tailwindcss init -p");
    }
  } catch (error) {
    console.error("Error checking for tailwindcss:", error);
  }

  return file.source;
}

function findMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function copyDirectory(source: string, destination: string) {
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
