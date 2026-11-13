import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace TypeScript packages directly (they ship source, no build).
  transpilePackages: ["@pcic/shared", "@pcic/ui"],
  // Don't auto-generate apps/web/AGENTS.md on dev/build.
  agentRules: false,
};

export default nextConfig;
