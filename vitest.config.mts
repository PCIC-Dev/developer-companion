import { defineConfig } from "vitest/config";

// Repo-wide unit-test runner. There are no tests yet by design; the suite is
// configured to pass cleanly with zero tests present (see --passWithNoTests).
export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    include: ["apps/**/*.{test,spec}.{ts,tsx}", "packages/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],
  },
});
