#!/usr/bin/env node
import path from "path";
import { execSync } from "child_process";

// Map of available transforms
const transforms: Record<string, string> = {
  "migrate-theme-config": "./transforms/migrate-theme-config.ts",
  "migrate-pages-to-app": "./transforms/migrate-pages-to-app.ts",
  "setup-search": "./transforms/setup-search.ts",
  "migrate-meta-files": "./transforms/migrate-meta-files.ts",
  "migrate-mdx-components": "./transforms/migrate-mdx-components.ts",
  "update-next-config": "./transforms/update-next-config.ts",
  "fix-conflicts": "./fixes/fix-conflicts.ts",
  "fix-tailwind": "./fixes/fix-tailwind.ts",
  "fix-nextra": "./fixes/fix-nextra.ts",
  "fix-next-config": "./fixes/fix-next-config.ts",
  "fix-all-styles": "./fixes/fix-all-styles.ts",
};

// Get command line arguments
const [, , transform, targetPath] = process.argv;

// Check if transform is provided
if (!transform) {
  console.log("Available transforms:");
  Object.keys(transforms).forEach((t) => console.log(`- ${t}`));
  process.exit(1);
}

// Check if transform exists
if (!transforms[transform]) {
  console.error(`Transform "${transform}" not found.`);
  console.log("Available transforms:");
  Object.keys(transforms).forEach((t) => console.log(`- ${t}`));
  process.exit(1);
}

// Check if target path is provided for non-fix transforms
if (!targetPath && !transform.startsWith("fix-")) {
  console.error(`Target path is required for "${transform}".`);
  process.exit(1);
}

// Get the transform path
const transformPath = path.resolve(__dirname, transforms[transform]);

// Run the transform
try {
  if (transform.startsWith("fix-")) {
    // For fix scripts, run them directly with tsx
    execSync(`tsx ${transformPath}`, { stdio: "inherit" });
  } else {
    // For other transforms, run them with jscodeshift
    execSync(
      `npx jscodeshift --parser=tsx --transform ${transformPath} ${targetPath}`,
      { stdio: "inherit" },
    );
  }
  console.log(
    `Successfully applied "${transform}" to "${targetPath || "project"}"`,
  );
} catch (error) {
  console.error(
    `Error applying "${transform}" to "${targetPath || "project"}":`,
    (error as Error).message,
  );
  process.exit(1);
}
