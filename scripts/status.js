#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Vibely - Project Status Check
 * Run all quality checks and display results
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n🔍 Vibely - Project Status Check\n");
console.log("═".repeat(50));

const checks = [
  {
    name: "Type Checking",
    command: "pnpm type-check",
    icon: "📝",
  },
  {
    name: "Linting",
    command: "pnpm lint",
    icon: "🔍",
  },
  {
    name: "Formatting",
    command: "pnpm format:check",
    icon: "🎨",
  },
  {
    name: "Build",
    command: "pnpm build",
    icon: "🏗️",
  },
];

const results = [];

checks.forEach((check) => {
  process.stdout.write(`${check.icon} ${check.name}... `);

  try {
    execSync(check.command, {
      stdio: "pipe",
      cwd: path.join(__dirname, ".."),
    });
    console.log("✅ PASSED");
    results.push({ name: check.name, passed: true });
  } catch (error) {
    console.log("❌ FAILED");
    results.push({ name: check.name, passed: false });
  }
});

console.log("═".repeat(50));
console.log("\n📊 Results:");

const passed = results.filter((r) => r.passed).length;
const total = results.length;
const percentage = Math.round((passed / total) * 100);

results.forEach((result) => {
  const status = result.passed ? "✅" : "❌";
  console.log(`  ${status} ${result.name}`);
});

console.log(`\n🎯 Score: ${passed}/${total} (${percentage}%)\n`);

if (passed === total) {
  console.log("🎉 All checks passed! Ready to deploy!\n");
  process.exit(0);
} else {
  console.log("⚠️  Some checks failed. Please fix before deploying.\n");
  process.exit(1);
}
