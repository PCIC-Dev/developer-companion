import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace TypeScript package directly (it ships source, no build).
  transpilePackages: ["@pcic/shared"],
  // Don't auto-generate apps/web/AGENTS.md on dev/build.
  agentRules: false,
};

export default nextConfig;
