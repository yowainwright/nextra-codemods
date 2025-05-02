import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/cli.ts",
    "src/transforms/migrate-theme-config.ts",
    "src/transforms/migrate-pages-to-app.ts",
    "src/transforms/setup-search.ts",
    "src/transforms/migrate-meta-files.ts",
    "src/transforms/migrate-mdx-components.ts",
    "src/transforms/update-next-config.ts",
    "src/fixes/fix-conflicts.ts",
    "src/fixes/fix-tailwind.ts",
    "src/fixes/fix-nextra.ts",
    "src/fixes/fix-next-config.ts",
    "src/fixes/fix-all-styles.ts",
  ],
  format: ["cjs", "esm"],
  dts: false, // Disable TypeScript declaration files
  clean: true,
  shims: true,
});
