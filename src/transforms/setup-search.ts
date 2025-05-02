import { FileInfo, API, Options } from "jscodeshift";
import fs from "fs";
import path from "path";

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options,
): string {
  const projectRoot = options.projectRoot || process.cwd();
  const packageJsonPath = path.join(projectRoot, "package.json");

  // Skip if package.json doesn't exist
  if (!fs.existsSync(packageJsonPath)) {
    console.log("package.json not found. Skipping search setup.");
    return file.source;
  }

  try {
    // Read package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    // Add pagefind to dependencies if not already present
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }

    if (!packageJson.dependencies.pagefind) {
      packageJson.dependencies.pagefind = "^1.0.3";
      console.log("Added pagefind to dependencies");
    }

    // Add tailwindcss to devDependencies if not already present
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }

    if (!packageJson.devDependencies.tailwindcss) {
      packageJson.devDependencies.tailwindcss = "^3.3.0";
      packageJson.devDependencies.postcss = "^8.4.31";
      packageJson.devDependencies.autoprefixer = "^10.4.16";
      console.log(
        "Added tailwindcss, postcss, and autoprefixer to devDependencies",
      );
    }

    // Add postbuild script for pagefind
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    if (!packageJson.scripts.postbuild) {
      packageJson.scripts.postbuild = "pagefind --source .next/server/app";
      console.log("Added postbuild script for pagefind");
    }

    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Create or update .gitignore to ignore pagefind files
    const gitignorePath = path.join(projectRoot, ".gitignore");
    let gitignoreContent = "";

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    }

    // Add pagefind to .gitignore if not already present
    if (!gitignoreContent.includes("# Pagefind")) {
      gitignoreContent += "\n# Pagefind\n.next/server/app/_pagefind\n";
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log("Updated .gitignore to ignore pagefind files");
    }

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

    // Create postcss.config.js if it doesn't exist
    const postcssConfigPath = path.join(projectRoot, "postcss.config.js");
    if (!fs.existsSync(postcssConfigPath)) {
      const postcssConfigContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
      fs.writeFileSync(postcssConfigPath, postcssConfigContent);
      console.log(`Created postcss.config.js at ${postcssConfigPath}`);
    }

    // Create app/globals.css if it doesn't exist
    const appDir = path.join(projectRoot, "app");
    if (fs.existsSync(appDir)) {
      const globalsCssPath = path.join(appDir, "globals.css");
      if (!fs.existsSync(globalsCssPath)) {
        const globalsCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
        fs.writeFileSync(globalsCssPath, globalsCssContent);
        console.log(`Created globals.css at ${globalsCssPath}`);
      }
    }

    console.log("\n\x1b[32mSearch setup completed!\x1b[0m");
    console.log("Pagefind will be run automatically after build.");
    console.log("Make sure to import globals.css in your app/layout.jsx file:");
    console.log("\nimport './globals.css'");
  } catch (error) {
    console.error("Error setting up search:", error);
  }

  return file.source;
}
