#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Helper function to run a command and show spinner
async function runCommand(command: string, message: string): Promise<void> {
  const spinner = ora(message).start();
  try {
    execSync(command, { stdio: "pipe" });
    spinner.succeed();
    return Promise.resolve();
  } catch (error) {
    spinner.fail(`Error: ${(error as Error).message}`);
    return Promise.reject(error);
  }
}

// Main migration function
async function migrateNextraV3ToV4() {
  console.log(chalk.bold.blue("\n🚀 Nextra v3 to v4 Migration Tool\n"));

  const projectRoot = process.cwd();

  // Check if this is a Nextra project
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.log(
      chalk.red(
        "❌ package.json not found. Make sure you are in the root of your project.",
      ),
    );
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const hasNextra =
    packageJson.dependencies?.nextra || packageJson.devDependencies?.nextra;

  if (!hasNextra) {
    const answer = await question(
      chalk.yellow(
        "⚠️ Nextra not found in dependencies. Continue anyway? (y/n) ",
      ),
    );
    if (answer.toLowerCase() !== "y") {
      console.log(chalk.blue("Migration cancelled."));
      process.exit(0);
    }
  }

  // Detect project structure
  const hasPages = fs.existsSync(path.join(projectRoot, "pages"));
  const hasApp = fs.existsSync(path.join(projectRoot, "app"));
  const hasThemeConfig =
    fs.existsSync(path.join(projectRoot, "theme.config.jsx")) ||
    fs.existsSync(path.join(projectRoot, "theme.config.js")) ||
    fs.existsSync(path.join(projectRoot, "theme.config.tsx"));

  console.log(chalk.cyan("\n📊 Project Analysis:"));
  console.log(
    `- Pages Directory: ${hasPages ? chalk.green("✓") : chalk.red("✗")}`,
  );
  console.log(`- App Directory: ${hasApp ? chalk.green("✓") : chalk.red("✗")}`);
  console.log(
    `- Theme Config: ${hasThemeConfig ? chalk.green("✓") : chalk.red("✗")}`,
  );

  // Confirm migration
  const confirm = await question(
    chalk.yellow(
      "\n⚠️ This will modify your project files. Make sure you have a backup or your changes are committed to git. Continue? (y/n) ",
    ),
  );
  if (confirm.toLowerCase() !== "y") {
    console.log(chalk.blue("Migration cancelled."));
    process.exit(0);
  }

  console.log(chalk.bold.green("\n🔄 Starting migration process...\n"));

  try {
    // Step 1: Backup important files
    console.log(chalk.cyan("📦 Step 1: Creating backups..."));

    if (hasPages) {
      fs.cpSync(
        path.join(projectRoot, "pages"),
        path.join(projectRoot, "pages.bak"),
        { recursive: true },
      );
      console.log(chalk.green("✅ Backed up pages directory to pages.bak"));
    }

    if (hasThemeConfig) {
      const themeConfigPath = fs.existsSync(
        path.join(projectRoot, "theme.config.jsx"),
      )
        ? path.join(projectRoot, "theme.config.jsx")
        : fs.existsSync(path.join(projectRoot, "theme.config.js"))
          ? path.join(projectRoot, "theme.config.js")
          : path.join(projectRoot, "theme.config.tsx");

      fs.copyFileSync(themeConfigPath, `${themeConfigPath}.bak`);
      console.log(
        chalk.green(
          `✅ Backed up theme config to ${path.basename(themeConfigPath)}.bak`,
        ),
      );
    }

    if (fs.existsSync(path.join(projectRoot, "next.config.js"))) {
      fs.copyFileSync(
        path.join(projectRoot, "next.config.js"),
        path.join(projectRoot, "next.config.js.bak"),
      );
      console.log(
        chalk.green("✅ Backed up next.config.js to next.config.js.bak"),
      );
    } else if (fs.existsSync(path.join(projectRoot, "next.config.mjs"))) {
      fs.copyFileSync(
        path.join(projectRoot, "next.config.mjs"),
        path.join(projectRoot, "next.config.mjs.bak"),
      );
      console.log(
        chalk.green("✅ Backed up next.config.mjs to next.config.mjs.bak"),
      );
    }

    if (hasThemeConfig) {
      console.log(chalk.cyan("\n📝 Step 2: Migrating theme config..."));
      const themeConfigPath = fs.existsSync(
        path.join(projectRoot, "theme.config.jsx"),
      )
        ? path.join(projectRoot, "theme.config.jsx")
        : fs.existsSync(path.join(projectRoot, "theme.config.js"))
          ? path.join(projectRoot, "theme.config.js")
          : path.join(projectRoot, "theme.config.tsx");

      await runCommand(
        `npx jscodeshift --parser=tsx --transform ${path.resolve(__dirname, "./transforms/migrate-theme-config.js")} ${themeConfigPath}`,
        "Migrating theme config...",
      );
    } else {
      console.log(
        chalk.yellow(
          "⚠️ No theme.config.jsx found. Skipping theme config migration.",
        ),
      );
    }

    if (hasPages) {
      console.log(
        chalk.cyan("\n📁 Step 3: Migrating pages to app directory..."),
      );

      if (hasApp) {
        const overwriteApp = await question(
          chalk.yellow("⚠️ App directory already exists. Overwrite? (y/n) "),
        );
        if (overwriteApp.toLowerCase() !== "y") {
          console.log(chalk.yellow("⚠️ Skipping pages migration."));
        } else {
          await runCommand(
            `npx jscodeshift --parser=tsx --transform ${path.resolve(__dirname, "./transforms/migrate-pages-to-app.js")} ${path.join(projectRoot, "pages")}`,
            "Migrating pages to app directory...",
          );
        }
      } else {
        await runCommand(
          `npx jscodeshift --parser=tsx --transform ${path.resolve(__dirname, "./transforms/migrate-pages-to-app.js")} ${path.join(projectRoot, "pages")}`,
          "Migrating pages to app directory...",
        );
      }
    } else {
      console.log(
        chalk.yellow("⚠️ No pages directory found. Skipping pages migration."),
      );
    }

    console.log(chalk.cyan("\n🔍 Step 4: Setting up search..."));
    await runCommand(
      `npx jscodeshift --parser=tsx --transform ${path.resolve(__dirname, "./transforms/setup-search.js")} ${packageJsonPath}`,
      "Setting up Pagefind search...",
    );

    console.log(chalk.cyan("\n⚙️ Step 5: Updating Next.js config..."));
    const nextConfigPath = fs.existsSync(
      path.join(projectRoot, "next.config.mjs"),
    )
      ? path.join(projectRoot, "next.config.mjs")
      : path.join(projectRoot, "next.config.js");

    if (fs.existsSync(nextConfigPath)) {
      await runCommand(
        `npx jscodeshift --parser=tsx --transform ${path.resolve(__dirname, "./transforms/update-next-config.js")} ${nextConfigPath}`,
        "Updating Next.js config...",
      );
    } else {
      console.log(
        chalk.yellow("⚠️ No next.config.js found. Creating a new one..."),
      );
      const newNextConfig = `const nextra = require('nextra')

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true
})

module.exports = withNextra({
  // Other Next.js configurations
})`;
      fs.writeFileSync(path.join(projectRoot, "next.config.js"), newNextConfig);
      console.log(chalk.green("✅ Created next.config.js"));
    }

    console.log(chalk.cyan("\n🎨 Step 6: Setting up styling..."));
    await runCommand(
      `node ${path.resolve(__dirname, "./fixes/fix-all-styles.js")}`,
      "Setting up Tailwind CSS and fixing styling issues...",
    );

    console.log(chalk.cyan("\n📦 Step 7: Updating dependencies..."));
    const updatedPackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8"),
    );

    if (updatedPackageJson.dependencies?.nextra) {
      updatedPackageJson.dependencies.nextra = "^4.0.0";
    }

    if (updatedPackageJson.dependencies?.["nextra-theme-docs"]) {
      updatedPackageJson.dependencies["nextra-theme-docs"] = "^4.0.0";
    }

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(updatedPackageJson, null, 2),
    );
    console.log(chalk.green("✅ Updated package.json with Nextra v4"));

    // Step 8: Install dependencies
    console.log(chalk.cyan("\n📥 Step 8: Installing dependencies..."));
    const spinner = ora("Installing dependencies...").start();
    try {
      execSync("pnpm install", { stdio: "pipe" });
      spinner.succeed("Dependencies installed with pnpm");
    } catch (error) {
      spinner.text = "Trying npm install...";
      try {
        execSync("npm install", { stdio: "pipe" });
        spinner.succeed("Dependencies installed with npm");
      } catch (npmError) {
        spinner.fail(
          `Failed to install dependencies: ${(npmError as Error).message}`,
        );
      }
    }

    console.log(chalk.bold.green("\n🎉 Migration completed successfully!\n"));
    console.log(chalk.cyan("Next steps:"));
    console.log(
      "1. Start your development server: " +
        chalk.bold("npm run dev") +
        " or " +
        chalk.bold("pnpm dev"),
    );
    console.log("2. Check your app at: " + chalk.bold("http://localhost:3000"));
    console.log(
      "3. Review the migrated files and make any necessary adjustments",
    );
    console.log("\nIf you encounter any issues, check the documentation at:");
    console.log(
      chalk.blue(
        "https://github.com/shuding/nextra/blob/main/docs/guide/migration/v3-to-v4.mdx",
      ),
    );
  } catch (error) {
    console.error(
      chalk.red(`\n❌ Migration failed: ${(error as Error).message}`),
    );
    console.log(
      chalk.yellow("\nYou can try running the individual steps manually:"),
    );
    console.log(
      "1. npx nextra-codemods migrate-theme-config ./theme.config.jsx",
    );
    console.log("2. npx nextra-codemods migrate-pages-to-app ./pages");
    console.log("3. npx nextra-codemods setup-search ./package.json");
    console.log("4. npx nextra-codemods update-next-config ./next.config.js");
    console.log("5. npx nextra-codemods fix-all-styles");
  } finally {
    rl.close();
  }
}

migrateNextraV3ToV4().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
