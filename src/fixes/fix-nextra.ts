#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";

console.log("Running fix-conflicts.ts...");
execSync(`tsx ${path.join(__dirname, "fix-conflicts.ts")}`, {
  stdio: "inherit",
});

console.log("\nRunning fix-tailwind.ts...");
execSync(`tsx ${path.join(__dirname, "fix-tailwind.ts")}`, {
  stdio: "inherit",
});

console.log("\nInstalling dependencies...");
try {
  execSync("pnpm install", { stdio: "inherit" });
} catch (error) {
  console.log("Failed to run pnpm install. Trying npm install...");
  execSync("npm install", { stdio: "inherit" });
}

console.log(
  "\nAll fixes applied. You can now restart your development server.",
);
